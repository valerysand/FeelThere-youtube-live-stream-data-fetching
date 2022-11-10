import http from 'http';
import url from 'url';
import open from 'open';
import destroyer from 'server-destroy';
import axios from 'axios';
import fs from 'fs';

// Authorize facebook 
async function authorizeFacebook(): Promise<any> {
    const token = await getToken();
    return token;
}

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

// Get the token 
export async function getToken(): Promise<string> {
    // if token valide return token
    const isValid = await checkTokenExpiration();
    if (isValid === true) {
        const token = fs.readFileSync('.env', 'utf8');
        return token;
    } else {
        // get the code from the url
        const code = await getAuthorizationFacebookCode();
        // get the token
        const response = await axios.get(
            `https://graph.facebook.com/v15.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=http://localhost:3000/oauth2callback&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`
        );
        // Replace token in file .env
        const env = fs.readFileSync('.env', 'utf8');
        const newEnv = env.replace(/FACEBOOK_ACCESS_TOKEN=.*/, `FACEBOOK_ACCESS_TOKEN=${response.data.access_token}`);
        fs.writeFileSync('.env', newEnv);
        return response.data.access_token;
    }

    // Check if token is valid
    async function checkTokenExpiration(): Promise<boolean> {
        const token = process.env.FACEBOOK_ACCESS_TOKEN;
        if (token) {
            const response = await axios.get(
                `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`
            );
            return response.data.data.is_valid;
        } else {
            return false;
        }
    }
}

async function facebookAuth() {
    
}
