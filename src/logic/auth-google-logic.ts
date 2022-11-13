import { Auth, google } from 'googleapis';
import http from 'http';
import url from 'url';
import opn from 'open';
import { IGooogleTokenModel, GoogleTokenModel } from '../model/token-models/google-token.model';

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


// // Get the token
export async function authorize(): Promise<Auth.OAuth2Client> {
    // Check if we have previously stored a token.
    const token = await getStoredToken();
    // If we have a token, set the credentials
    if (token) {
        // Check if token is valid
        const isExpired = isTokenExpired();
        if (!isExpired) {
            auth.setCredentials(token);
            return auth;
        } else {
            // If token is expired, refresh it
            const newToken = await auth.refreshAccessToken();
            console.log('Google token refreshed: ', newToken);
            // Save the new token to mongoDB
            await GoogleTokenModel.updateOne({ name: 'Google - access token' }, {
                $set: {
                    token: newToken.credentials.refresh_token,
                }
            });
            // Set the credentials
            auth.setCredentials(newToken.credentials);
            return auth;
        }
    } else {
        // If we don't have a token, get one
        // get the code from the url
        const code = await getAuthorizationCode();
        // get the token
        const token = await auth.getToken(code);
        // set the token
        auth.setCredentials(token.tokens);
        // // store the token in mongoDB
        const tokenToStore: IGooogleTokenModel = new GoogleTokenModel({
            name: 'Google - access token',
            accessToken: token.tokens.access_token?.toString(),
            refreshToken: token.tokens.refresh_token?.toString(),
            expiryDate: token.tokens.expiry_date ? new Date(token.tokens.expiry_date) : new Date(),
        });
        // // Remove old token
        await GoogleTokenModel.deleteOne({ name: 'Google - access token' });
        // Save the token in mongoDB
        tokenToStore.save();
        // return the auth
        return auth;
    }
}

// Get stored token
async function getStoredToken(): Promise<Auth.Credentials | null> {
    try {
        // Get the token from mongoDB
        const token = await GoogleTokenModel.findOne({ name: 'Google - access token' });
        // Check if the token is valid
        if (token) {
            return {
                access_token: token.accessToken,
                refresh_token: token.refreshToken,
            };
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// Check if token is expired
export function isTokenExpired(): boolean {
    const expiryDate = auth.credentials.expiry_date;
    const currentDate = new Date().getTime();
    if (expiryDate < currentDate) {
        return true;
    } else {
        return false;
    }
}