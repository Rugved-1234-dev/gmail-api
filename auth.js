const {google}  = require('googleapis');

const authenticateUser = async  (req, res) => {
    try { 
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
          );
          
          // generate a url that asks permissions for Gmail scopes
          const scopes = [
            'https://www.googleapis.com/auth/gmail.send'
          ];
          
          const url = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            scope: scopes
          });
          return res.redirect(url);

    } catch(err) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
}

const  handleCallback = async (req, res) => {
    try {
        const 
    } catch (err) {

    }

}

