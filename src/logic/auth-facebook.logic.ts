import http from 'http';
import url from 'url';
import open from 'open';
import destroyer from 'server-destroy';
import axios from 'axios';
import { IFacebookTokenModel, FacebookTokenModel } from '../model/token-models/facebook-token.model';


// Genereate a url that asks permissions for Youtube scopes
const authUrl: string = `https://www.facebook.com/v15.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=http://localhost:3000/oauth2callback&scope=email&response_type=code&auth_type=rerequest`;

// redirect user to the url and get the code from the url
async function getAuthorizationFacebookCode(): Promise<string> {
    return new Promise((resolve, reject) => {
        const server: http.Server = http.createServer(async (req, res) => {
            if (req.url?.indexOf('/oauth2callback') > -1) {
                const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
                const code = qs.get('code');
                res.end('Authentication successful! Please return to the console.');
                server.destroy();
                resolve(code);
            }
        }).listen(3000, () => {
            // open the browser to the authorize url to start the workflow
            open(authUrl, { wait: false }).then(cp => cp.unref());
        });
        destroyer(server);
    });

}

// Get the access token 
export async function getAcсessToken(): Promise<string> {
    // Check stored token to expire
    const isValid = await checkTokenExpiration();
    if (isValid === true) {
        const token = await getStoredToken();
        return token;
    } else {
        // get the code from the url
        const code = await getAuthorizationFacebookCode();
        // get the token
        const access_token = await axios.get(
            `https://graph.facebook.com/v15.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=http://localhost:3000/oauth2callback&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`
        );
        // Save access token to mongoDB
        const saveToken: IFacebookTokenModel = new FacebookTokenModel({
            name: 'Facebook - access token',
            accessToken: access_token.data.access_token,
            expiresIn: access_token.data.expires_in,
        });
        // Replace the old token with the new one
        await FacebookTokenModel.deleteOne({ name: 'Facebook - access token' });
        // Save the new token
        await saveToken.save();
        return access_token.data.access_token;
    }

    // Check if token is valid
    async function checkTokenExpiration(): Promise<boolean> {
        try {
            // Get the token from mongoDB
            const token = await getStoredToken();
            // Get the token info
            const response = await axios.get(
                `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`
            );
            return response.data.data.is_valid;
        }
        catch (err: any) {
            return false;
        }
    }
}

// Get the token from mongoDB
async function getStoredToken(): Promise<string> {
    const token = await FacebookTokenModel.findOne({ name: 'Facebook - access token' });
    if (token) {
        return token.accessToken;
    } else {
        return '';
    }
}

