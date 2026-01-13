import extractAnimeInfo from "../extractors/animeInfo.extractor.js";
import extractSeasons from "../extractors/seasons.extractor.js";
import extractPage from "../helper/extractPages.helper.js";
import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export const getAnimeInfo = async (req, res) => {
  const { id } = req.params;
  // const cacheKey = `animeInfo_${id}`;

  try {
    // const cachedResponse = await getCachedData(cacheKey);
    // if (cachedResponse && Object.keys(cachedResponse).length > 0) {
    //   return cachedResponse;
    // }
    const [animeData, seasons] = await Promise.all([
      extractAnimeInfo(id),
      extractSeasons(id),
    ]);

    // Fetch most popular animes
    const mostPopularAnimes = await extractPage(1, "most-popular");

    // Map related and recommended animes
    const mappedRelatedAnimes = (animeData.related_data || []).map(item => ({
      id: item.id,
      name: item.title,
      jname: item.japanese_title,
      poster: item.poster,
      episodes: {
        sub: item.tvInfo.sub ? parseInt(item.tvInfo.sub) : null,
        dub: item.tvInfo.dub ? parseInt(item.tvInfo.dub) : null
      },
      type: item.tvInfo.showType
    }));

    const mappedRecommendedAnimes = (animeData.recommended_data || []).map(item => ({
      id: item.id,
      name: item.title,
      jname: item.japanese_title,
      poster: item.poster,
      duration: item.tvInfo.duration,
      type: item.tvInfo.showType,
      rating: item.adultContent ? "18+" : null,
      episodes: {
        sub: item.tvInfo.sub ? parseInt(item.tvInfo.sub) : null,
        dub: item.tvInfo.dub ? parseInt(item.tvInfo.dub) : null
      }
    }));

    const responseData = {
      anime: {
        info: {
          id: animeData.id,
          anilistId: animeData.anilistId || 0,
          malId: animeData.malId || 0,
          name: animeData.title,
          poster: animeData.poster,
          description: animeData.animeInfo?.Overview || "",
          stats: {
            rating: animeData.animeInfo?.tvInfo?.rating || "PG-13",
            quality: animeData.animeInfo?.tvInfo?.quality || "HD",
            episodes: {
              sub: animeData.animeInfo?.tvInfo?.sub ? parseInt(animeData.animeInfo.tvInfo.sub) : 0,
              dub: animeData.animeInfo?.tvInfo?.dub ? parseInt(animeData.animeInfo.tvInfo.dub) : 0,
            },
            type: animeData.showType,
            duration: animeData.animeInfo?.tvInfo?.duration || "",
          },
          promotionalVideos: animeData.animeInfo?.trailers || [],
          charactersVoiceActors: animeData.charactersVoiceActors || [],
        },
        moreInfo: {
          japanese: animeData.japanese_title,
          synonyms: animeData.synonyms,
          aired: animeData.animeInfo?.Aired || "",
          premiered: animeData.animeInfo?.Premiered || "",
          duration: animeData.animeInfo?.tvInfo?.duration || "",
          status: animeData.animeInfo?.Status || "",
          malscore: animeData.animeInfo?.MAL || "",
          genres: animeData.animeInfo?.Genres || [],
          studios: animeData.animeInfo?.Studios || "",
          producers: animeData.animeInfo?.Producers || [],
        },
      },
      seasons: seasons || [],
      mostPopularAnimes: mostPopularAnimes[0] || [],
      relatedAnimes: mappedRelatedAnimes,
      recommendedAnimes: mappedRecommendedAnimes,
    };
    // setCachedData(cacheKey, responseData).catch((err) => {
    //   console.error("Failed to set cache:", err);
    // });
    return responseData;
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "An error occurred" });
  }
};
