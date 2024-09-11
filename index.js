import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis";
import fs from "fs";
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);


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


    fs.writeFileSync("tokens.json", JSON.stringify(tokens));

    oauth2Client.setCredentials(tokens);

    return res.json({
      token: tokens,
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid credentials" });
  }
};


const getToken = async (refreshToken) => {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    fs.writeFileSync("tokens.json", JSON.stringify(credentials));
    return credentials.access_token;
  } catch (err) {
    console.error("Error in refreshing token:", err);
    throw err;
  }
};


const mailAPI = async (baseUrl, encodedEmail, token) => {
  try {
    const result = await axios.post(
      baseUrl,
      {
        raw: encodedEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      message: "Email sent successfully",
      result: result.data,
    };
  } catch (err) {
    console.error("Error in mailAPI:", err.response ? err.response.data : err.message);
    // throw err;
    return {
      message: "Error sending email",
      error: err.response.data || err.message
    }

  }
};


const sendMail = async (req, res) => {
  try {
    const { subject, body, to } = req.body;

    if (!to) {
      return res.status(400).json({
        message: "Please enter the email address",
      });
    }

    const tokens = JSON.parse(fs.readFileSync("tokens.json"));
    let accessToken = tokens.access_token;

    if (!accessToken) {
      return res.status(401).json({
        message: "Access token is missing or invalid",
      });
    }

    const baseUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";


    const emailContent = [
      `From: "Your Name" <${process.env.USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/html; charset="UTF-8"',
      "",
      `${body}`,
    ].join("\n");


    const base64EncodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    try {

      const result = await mailAPI(baseUrl, base64EncodedEmail, accessToken);
      return res.json(result);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        accessToken = await getToken(tokens.refresh_token);
        const result = await mailAPI(baseUrl, base64EncodedEmail, accessToken);
        return res.json(result);
      }

      throw err;
    }
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
    return res.status(500).json({
      message: "Error sending email",
      error: err.response ? err.response.data : err.message,
    });
  }
};

app.get("/auth/initiate", authenticateUser);
app.get("/auth/callback", handleCallback);
app.post("/sendMail", sendMail); 


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
