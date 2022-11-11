
import { connect } from "mongoose";

async function connectToMongoDB(): Promise<void> {
    try {
        const db = await connect(process.env.MONGO_URL);
        console.log("we're connected to MongoDB: " + db.connections[0].name);
    }
    catch (err: any) {
        console.log(err);
    }
}


export default {
    connectToMongoDB
};
