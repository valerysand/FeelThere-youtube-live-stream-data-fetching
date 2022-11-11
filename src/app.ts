import dotenv from 'dotenv';
dotenv.config();
import mongo from "./dal/mongo";
import { getDataYoutube } from "./logic/youtube-logic";
import { getMyLiveVideos } from './logic/facebook-logic';


// Main function
async function main() {
    // connect to MongoDB
    await mongo.connectToMongoDB();
    // get data from youtube
    await getDataYoutube();

    // get data from facebook
    // await getMyLiveVideos();

}

// Run main function
main();




