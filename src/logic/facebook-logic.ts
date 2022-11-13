import axios from "axios";
import { FacebookStreamModel, IFacebookStreamModel } from "../model/stream-models/facebook-stream.model";
import { getAcсessToken } from "./auth-facebook.logic";

// Get my live videos
export async function getMyLiveVideos(): Promise<any> {
    const access_token = await getAcсessToken();
    // Check if token is valid
    if (access_token) {
        // Get the live videos
        const response = await axios.get(
            `https://graph.facebook.com/v15.0/me?fields=id%2Cname%2Clive_videos%7Bid%2Ctitle%2Cdescription%2Clive_views%2Ccomments%7Bmessage%7D%2Creactions%7D&access_token=${access_token}`
        );
        // 
        const liveStream = response.data.live_videos.data[0];
        // Check if the stream is live
        console.log(liveStream.reactions.data);
        if (liveStream) {
            // Check if the stream is already in the database
            const isStreamInDB = await FacebookStreamModel.findOne({ streamId: liveStream.id });
            if (!isStreamInDB) {
                // Save the stream to the database
                const saveStream: IFacebookStreamModel = new FacebookStreamModel({
                    streamId: liveStream.id,
                    title: liveStream.title,
                    description: liveStream.description,
                    reactions: liveStream.reactions?.data.map((reaction: any) => reaction.type),
                    views: liveStream.live_views,
                    comments: liveStream.comments.data.map((comment: any) => comment.message),
                });
                // Save the stream
                await saveStream.save();
                console.log('Facebook live stream data saved in mongoDB');
                return saveStream;
            }
            else {
                // Update the stream in the database
                await FacebookStreamModel.updateOne({ streamId: liveStream.id }, {
                    $set: {
                        title: liveStream.title,
                        description: liveStream.description,
                        reactions: liveStream.reactions?.data.map((reaction: any) => reaction.type),
                        views: liveStream.live_views,
                        comments: liveStream.comments.data.map((comment: any) => comment.message),
                    }
                });
                console.log('Facebook live stream data updated in mongoDB');
                return isStreamInDB;
            }
        }
        else {
            console.log('No live stream found on Facebook ');
            return null;
        }
    }
    else {
        console.log('No access token for Facebook');
        return null;
    }
}

