import { extractor } from "../extractors/category.extractor.js";
import { getCachedData, setCachedData } from "../helper/cache.helper.js";
import extractPage from "../helper/extractPages.helper.js";
import { routeTypes } from "../routes/category.route.js";
import extractTopTen from "../extractors/topten.extractor.js";

const genres = routeTypes
  .slice(0, 41)
  .map((genre) => genre.replace("genre/", ""));

export const getCategory = async (req, res, routeType) => {
  try {
    // CRITICAL: Validate routeType before proceeding
    if (!routeType || routeType === 'undefined') {
      console.error('❌ Invalid routeType received:', { routeType, path: req.path, params: req.params });
      throw new Error(`Invalid routeType: ${routeType}. Please check your route configuration.`);
    }

    // Fix the typo for martial-arts
    if (routeType === "genre/martial-arts") {
      routeType = "genre/marial-arts"; // Note: Check if this typo fix is still needed
    }
    
    const requestedPage = parseInt(req.query.page) || 1;
    
    console.log('📝 Processing category request:', {
      routeType,
      requestedPage,
      query: req.query
    });

    // const cacheKey = `${routeType.replace(/\//g, "_")}_page_${requestedPage}`;
    
    // const cachedResponse = await getCachedData(cacheKey);
    // if (cachedResponse && Object.keys(cachedResponse).length > 0)
    //   return cachedResponse;
    
    // Call extractor with validated routeType
    console.log('🔍 Calling extractor with:', { routeType, requestedPage });
    const { data, totalPages } = await extractor(routeType, requestedPage);
    
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
    
    // Generate category name
    const category = routeType.startsWith("genre/")
      ? routeType
          .split("/")[1]
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") + " Anime"
      : routeType.charAt(0).toUpperCase() + routeType.slice(1) + " Anime";
    
    const responseData = {
      animes: data,
      genres,
      top10Animes,
      topAiringAnimes: topAiringData,
      category,
      totalPages,
      hasNextPage: requestedPage < totalPages,
      currentPage: requestedPage
    };
    
    console.log('✅ Category data fetched successfully:', {
      category,
      animesCount: data?.length || 0,
      totalPages,
      currentPage: requestedPage
    });
    
    // setCachedData(cacheKey, responseData).catch((err) => {
    //   console.error("Failed to set cache:", err);
    // });
    
    return responseData;
  } catch (e) {
    console.error('❌ Error in getCategory:', {
      message: e.message,
      routeType,
      requestedPage: req.query.page,
      stack: e.stack
    });
    
    // Return a proper error object instead of the error itself
    return {
      success: false,
      error: e.message || 'An error occurred while fetching category data',
      status: e.status || 500
    };
  }
};