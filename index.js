import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); 
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// Check the validity of the access token
const checkAccessToken = async () => {
  try {
    const tokenInfo = await oauth2Client.getTokenInfo(oauth2Client.credentials.access_token);
    console.log('Access token is valid.');
    return true; // token is valid
  } catch (err) {
    console.log('Access token is invalid or expired.');
    return false; // token is invalid or expired
  }
};

// Refresh the access token using the refresh token
const checkRefreshToken = async () => {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken(); // Automatically refreshes
    oauth2Client.setCredentials(credentials); // Update OAuth2 client with new credentials
    console.log('Tokens refreshed successfully.');
    return true;
  } catch (err) {
    console.log('Failed to refresh tokens.', err.message);
    return false;
  }
};

// Validate tokens before sending email
const validateTokens = async () => {
  const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));

  // Set the OAuth2 credentials
  oauth2Client.setCredentials(tokens);

  // Check if the access token is valid
  const isAccessTokenValid = await checkAccessToken();

  if (!isAccessTokenValid) {
    console.log('Access token is expired. Attempting to refresh...');
    const isRefreshTokenValid = await checkRefreshToken();
    if (isRefreshTokenValid) {
      // Store the new tokens to file
      fs.writeFileSync('tokens.json', JSON.stringify(oauth2Client.credentials));
      console.log('New tokens saved.');
      return true;
    } else {
      console.log('Both access and refresh tokens are invalid.');
      return false;
    }
  }
  return true; // Access token is valid
};

const authenticateUser = async (req, res) => {
  try {
    const scopes = ["https://www.googleapis.com/auth/gmail.send"];
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
    return res.redirect(url);
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid credentials" });
  }
};

const handleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);

    // Save the tokens to a file for later use
    fs.writeFileSync("tokens.json", JSON.stringify(tokens));

    return res.json({
      token: tokens,
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid credentials" });
  }
};

const sendMail = async (req, res) => {
  try {
    const { subject, body, to } = req.body;

    // Prepare the email content in RFC 822 format
    const emailContent = [
      `From: "Your Name" <${process.env.USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      `${body}`,
    ].join('\n');

    // Encode the email in base64 to use in Gmail API
    const base64EncodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Send the email using the Gmail API
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: base64EncodedEmail,
      },
    });

    return res.json({
      message: "Email sent successfully",
      result: result.data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error sending email",
    });
  }
};

// Define routes
app.get("/auth/initiate", authenticateUser);
app.get("/auth/callback", handleCallback);
app.post("/sendMail", sendMail); // Route for sending email

// Listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
