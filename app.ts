import dotenv from 'dotenv';
dotenv.config();
import { getDataYoutube } from "./src/logic/youtube-logic";
import mongo from "./src/dal/mongo";


// Main function
async function main() {
    // connect to MongoDB
    await mongo.connectToMongoDB();
    // get data from youtube
    await getDataYoutube();
}

main();

