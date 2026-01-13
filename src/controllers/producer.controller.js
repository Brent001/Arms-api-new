import { getCachedData, setCachedData } from "../helper/cache.helper.js";
import extractPage from "../helper/extractPages.helper.js";
import extractTopTen from "../extractors/topten.extractor.js";

export const getProducer = async (req) => {
  const { id } = req.params;
  const routeType = `producer/${id}`;
  const requestedPage = parseInt(req.query.page) || 1;
  // const cacheKey = `${routeType.replace(/\//g, "_")}_page_${requestedPage}`;
  try {
    // const cachedResponse = await getCachedData(cacheKey);
    // if (cachedResponse && Object.keys(cachedResponse).length > 0) {
    //   return cachedResponse;
    // }
    const [data, totalPages] = await extractPage(requestedPage, routeType);
    if (requestedPage > totalPages) {
      const error = new Error("Requested page exceeds total available pages.");
      error.status = 404;
      throw error;
    }
    
    // Fetch top 10 animes
    console.log('🔍 Fetching top 10 animes...');
    const top10Animes = await extractTopTen();
    
    // Fetch top airing animes
    console.log('🔍 Fetching top airing animes...');
    const [topAiringData] = await extractPage(1, "top-airing");
    
    // Generate producer name
    const producerName = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + " Anime";
    
    const responseData = {
      producerName,
      animes: data,
      top10Animes,
      topAiringAnimes: topAiringData,
      totalPages,
      hasNextPage: requestedPage < totalPages,
      currentPage: requestedPage
    };
    // setCachedData(cacheKey, responseData).catch((err) => {
    //   console.error("Failed to set cache:", err);
    // });
    return responseData;
  } catch (e) {
    console.error(e);
    if (e.status === 404) {
      throw e;
    }
    throw new Error("An error occurred while processing your request.");
  }
};
