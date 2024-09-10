* **Token Management:** Stores and manages access tokens and refresh tokens for subsequent API calls.

**Prerequisites**

* Node.js and npm (or yarn) installed
* A Google Cloud Platform project with OAuth credentials configured
* A `.env` file with the following environment variables:
    * `CLIENT_ID`
    * `CLIENT_SECRET`
    * `REDIRECT_URI`
    * `USER` (optional, for sending emails)

**Installation**

1. Clone this repository or download the project files.
2. Install dependencies using `npm install` or `yarn install`.

**Usage**

1. Run the server using `node index.js`.
2. Access the API endpoints:
    * **Authentication:** `GET /auth/initiate`
    * **Callback:** `GET /auth/callback`
    * **Send Email:** `POST /sendMail` (requires authentication)


# `.env.example`

```
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:3000/auth/callback
PORT=3000
USER=your_email@example.com
```



**Key Features**

* **Secure Authentication:** Uses Google OAuth2 for secure user authentication.
* **Token Management:** Stores and manages access tokens and refresh tokens to enable long-term authentication.
* **Email Sending:** Provides an endpoint for sending emails using Gmail's OAuth2 API.
* **Error Handling:** Includes error handling and informative error messages.

**Additional Notes**

* **Token Storage:** The access and refresh tokens are currently stored in a local file (`tokens.json`). For production environments, consider using a more secure storage mechanism like a database.
* **Email Configuration:** Ensure you have the necessary credentials and permissions set up in your Google Cloud project to send emails using the Gmail API.
* **Security:** Protect your client secret and other sensitive information. Avoid exposing them in public repositories.

**Contributing**

Contributions are welcome! Please feel free to submit pull requests or issues.
