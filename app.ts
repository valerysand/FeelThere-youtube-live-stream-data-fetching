import dotenv from 'dotenv';
dotenv.config();
import { getDataYoutube } from "./src/logic/youtube-logic";
import mongo from "./src/dal/mongo";
import { getMyLiveVideos } from './src/logic/facebook-logic';
import { getToken } from './src/logic/auth-facebook.logic';


// Main function
async function main() {
    // connect to MongoDB
    await mongo.connectToMongoDB();
    // get data from youtube
    // await getDataYoutube();

    // get data from facebook
    const token = await getToken();
    const data = await getMyLiveVideos(token);
    console.log(data);


}

main();


