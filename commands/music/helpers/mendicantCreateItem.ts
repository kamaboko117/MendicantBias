import ytdl from "@distube/ytdl-core";
import dotenv from "dotenv";
import * as youtubei from "youtubei";
import VideoDetails from "../../../classes/VideoDetails";
dotenv.config({ path: "./.env" });

const cookiesBase64 = process.env.YTCOOKIE || "";
const cookiesJson = Buffer.from(cookiesBase64, "base64").toString("utf-8");
const cookies = cookiesJson && JSON.parse(cookiesJson);

//creates a queue item without downloading the resource stream
export const mendicantCreateItem = async (
  videoID: string,
  details: VideoDetails | null,
  module = "ytdl"
) => {
  if (details) {
    return details;
  }

  if (module === "youtubei") {
    const youtube = new youtubei.Client();
    console.log(`getting video details for ${videoID}`);
    const videoDetailsRaw = await youtube.getVideo(videoID);
    console.log(`got video details for ${videoID}`);
    const videoDetails = new VideoDetails(
      videoID,
      videoDetailsRaw?.title ?? "",
      videoDetailsRaw instanceof youtubei.Video ? videoDetailsRaw.duration : 0
    );

    return videoDetails;
  } else {
    // default to using ytdl-core to get video details
    const agent = cookies ?? ytdl.createAgent(cookies);
    const videoInfo = await ytdl.getBasicInfo(videoID, { agent: agent });
    const videoDetails = new VideoDetails(
      videoID,
      videoInfo.videoDetails.title,
      parseInt(videoInfo.videoDetails.lengthSeconds, 10)
    );

    return videoDetails;
  }
};
