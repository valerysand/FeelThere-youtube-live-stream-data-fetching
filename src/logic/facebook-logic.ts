import axios from "axios";
import { FacebookStreamModel, IFacebookStreamModel } from "../model/facebook-stream.model";


// Get my user Data
export async function getMyUserData(token: string): Promise<any> {
    const response = await axios.get(
        `https://graph.facebook.com/v15.0/me?fields=id%2Cname%2Cemail&access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
    );
    return response.data;
}
// Get my live videos
export async function getMyLiveVideos(token: string): Promise<any> {
    const response = await axios.get(
        `https://graph.facebook.com/v15.0/me?fields=id%2Cname%2Clive_videos%7Bid%2Ctitle%2Cdescription%2Clive_views%2Ccomments%7Bmessage%7D%2Creactions%7D&access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
    );
    const liveStream = response.data.live_videos.data[0];
    // Save the data to the DB
    const data: IFacebookStreamModel = new FacebookStreamModel({
        streamId: liveStream.id,
        title: liveStream.title,
        description: liveStream.description,
        reactions: liveStream.reactions.data.length,
        views: liveStream.live_views,
        comments: liveStream.comments.data.map((comment: any) => comment.message),
    });
    data.save();
    console.log('Data saved in mongoDB');
    return data;
}

