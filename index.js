import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis";
import fs from "fs";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON

const authenticateUser = async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    // generate a URL that asks permissions for Gmail scopes
    const scopes = ["https://www.googleapis.com/auth/gmail.send"];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline", // gets refresh_token
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
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

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

    const tokens = JSON.parse(fs.readFileSync("tokens.json", "utf8"));

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "rugved@quickwork.co",
        clientId: process.env.CLIENT_ID,
        password: "vngt grnh sdwo dqea",
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
      },
    });

    const mailOptions = {
      from: "rugved@quickwork.co",
      to: to,
      subject: subject,
      text: "Hello from gmail using API",
      html: `<p>${body}</p>`,
    };

    const result = await transport.sendMail(mailOptions);
    return res.json({
      message: "Email sent successfully",
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
