import { IYoutubeStreamModel, YoutubeStreamModel } from '../model/stream-models/youtube-stream.model';
import { google, youtube_v3, Auth } from 'googleapis';
import { authorize } from './auth-google-logic';


// get data from my live stream, and coments, likes, dislikes, views, etc
export async function getDataYoutube(): Promise<void> {
    const auth: Auth.OAuth2Client = await authorize();
    // check if auth is valid
    if (auth) {
        // get the auth client
        const youtube: youtube_v3.Youtube = google.youtube({
            version: 'v3',
            auth: auth,
        });
        // get all my live streams
        const responseStreams = await youtube.liveBroadcasts.list({
            part: ['snippet', 'status'],
            broadcastType: 'all',
            mine: true,
        });
        // my live stream
        const liveStream = responseStreams.data.items[0];
        // get likes, dislikes, views, comments, etc from my live stream
        const responseData = await youtube.videos.list({
            part: ['statistics'],
            id: [liveStream.id],
        });
        // my statistics from the live stream (likes, dislikes, views, comments, etc)
        const statistics = responseData.data.items[0].statistics;
        // Save data in mongoDB
        const stream: IYoutubeStreamModel = new YoutubeStreamModel({
            streamId: liveStream.id,
            title: liveStream.snippet.title,
            description: liveStream.snippet.description,
            likes: statistics.likeCount,
            dislikes: statistics.dislikeCount,
            views: statistics.viewCount,
            comments: statistics.commentCount,
        });
        // Check if the stream already exists in the database
        const streamExists = await YoutubeStreamModel.findOne({ streamId: stream.streamId });
        if (!streamExists) {
            // If the stream does not exist, save it
            await stream.save();
            console.log('Youtube stream data saved');
        } else {
            // If the stream exists, update it
            await YoutubeStreamModel.updateOne({ streamId: stream.streamId }, {
                // Set the new values
                $set: {
                    likes: stream.likes,
                    dislikes: stream.dislikes,
                    views: stream.views,
                    comments: stream.comments,
                },
            });
            console.log('Youtube stream data updated');
        }
    }
    else {
        console.log('You are not authorized to access this data from Youtube');
    }
}

