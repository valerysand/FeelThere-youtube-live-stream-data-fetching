import { Auth, google } from 'googleapis';
import http from 'http';
import url from 'url';
import opn from 'open';
import fs from 'fs';

// Create the OAuth2 client with the credentials
const auth: Auth.OAuth2Client = new google.auth.OAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});

// Scopes for youtube
const scopes: string[] = [
    'https://www.googleapis.com/auth/youtube.readonly',
];

// Genereate a url 
const authUrl: string = auth.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
});

// Get the code from the query string of the url that is returned after redirecting the user to the authUrl
async function getAuthorizationCode(): Promise<string> {
    return new Promise<string>((resolve) => {
        const server = http.createServer((req, res) => {
            if (req.url.indexOf('/oauth2callback') > -1) {
                const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
                res.end('Authentication successful! Please return to the console.');
                const code = qs.get('code');
                server.close();
                resolve(code);
            }
        }).listen(3000, () => {
            // open the browser to the authorize url to start the workflow
            opn(authUrl, { wait: false }).then(cp => cp.unref());
        });
    });
}

// Get the token
export async function authorize(): Promise<Auth.OAuth2Client> {
    // Check if stored token is valid
    const storedToken = await getStoredToken();
    if (storedToken) {
        auth.setCredentials({
            access_token: storedToken.access_token,
            refresh_token: storedToken.refresh_token,
        });
        return auth;

    } else {
        // get the code from the url
        const code = await getAuthorizationCode();
        // get the token
        const token = await auth.getToken(code);
        // set the token
        auth.setCredentials(token.tokens);
        // store token in .env file
        fs.writeFileSync('token.json', JSON.stringify(token.tokens));
        return auth;
    }
}

// Get stored token
async function getStoredToken(): Promise<Auth.Credentials | null> {
    try {
        const token = fs.readFileSync('token.json', 'utf8');
        return JSON.parse(token);
    } catch (error) {
        return null;
    }
}

