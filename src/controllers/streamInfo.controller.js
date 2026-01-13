import { extractStreamingInfo } from "../extractors/streamInfo.extractor.js";

export const getStreamInfo = async (req, res, fallback = false) => {
  try {
    const input = req.query.animeEpisodeId;
    const server = req.query.server;
    const type = req.query.category;
    const match = input.match(/ep=(\d+)/);
    if (!match) throw new Error("Invalid URL format");
    const finalId = match[1];
    const streamingInfo = await extractStreamingInfo(finalId, server, type, fallback);

    const combinedData = {
      headers: {
        Referer: streamingInfo.streamingLink?.iframe // Use actual referer if available
      },
      tracks: streamingInfo.streamingLink?.tracks || [],
      intro: streamingInfo.streamingLink?.intro || null,
      outro: streamingInfo.streamingLink?.outro || null,
      sources: streamingInfo.streamingLink?.link ? [{
        url: streamingInfo.streamingLink.link.file,
        type: streamingInfo.streamingLink.link.type
      }] : [],
      anilistID: null, // Not available from current extractor
      malID: null, // Not available from current extractor
      iframe: streamingInfo.streamingLink?.iframe || null,
      servers: streamingInfo.servers || []
    };

    return combinedData;
  } catch (e) {
    console.error(e);
    throw new Error(e.message);
  }
};
