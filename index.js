const {google}  = require('googleapis');
const nodemailer = require("nodemailer");
require('dotenv').config()

const CLIENT_ID = '13262829095-0aji33823e1hf271h36d9ff3pka4nufj.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04oOe5kJ_pF8kCgYIARAAGAQSNwF-L9Irkj8JWRIMUTMERQfEebx4KlHtcgFvI5mnUJoK9yxRFp_2UM30xzWZ23cLigHF0GBClc4'





// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// async function sendMail() {
//     try {
//         const auth = await oAuth2Client.getAccessToken();
//         const transport =  nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 type: 'OAuth2',
//                 user: 'rugved@quickwork.co',
//                 clientId: CLIENT_ID,
//                 clientSecret:  CLIENT_SECRET,
//                 refreshToken: REFRESH_TOKEN,
//                 accessToken: auth

//             }
//         })

//         const mailOptions = {
//             from: 'rugved@quickwork.co',
//             to: 'rugvedkute02@gmail.com',
//             subject: 'Hello from gmail using API',
//             text: 'Hello from gmail using API',
//             html:  '<b>Hello from gmail using API</b>'

//         }

//         const result = await  transport.sendMail(mailOptions);
//         return result
//     } catch(err) {
//         console.log(err);
//     }
// }

// sendMail().then((res) => console.log(res)).catch((err) => {
//     console.log(err)
// })