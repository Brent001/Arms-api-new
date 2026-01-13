import extractEpisodesList from "../extractors/episodeList.extractor.js";
import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export const getEpisodes = async (req,res) => {
  const { id } = req.params;
  // const cacheKey = `episodes_${id}`;
  try {
    // const cachedResponse = await getCachedData(cacheKey);
    // if (cachedResponse && Object.keys(cachedResponse).length > 0) {
    //   return cachedResponse;
    // }
    const data = await extractEpisodesList(encodeURIComponent(id));
    // Transform the episodes to match the desired schema
    const transformedData = {
      totalEpisodes: data.totalEpisodes,
      episodes: data.episodes.map(ep => ({
        title: ep.title,
        episodeId: ep.id,
        number: ep.episode_no,
        isFiller: ep.filler
      }))
    };
    // setCachedData(cacheKey, transformedData).catch((err) => {
    //   console.error("Failed to set cache:", err);
    // });
    return transformedData;
  } catch (e) {
    console.error("Error fetching episodes:", e);
    return e;
  }
};
