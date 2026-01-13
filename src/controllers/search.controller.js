import extractSearchResults from "../extractors/search.extractor.js";
import convertForeignLanguage from "../helper/foreignInput.helper.js";
import extractPage from "../helper/extractPages.helper.js";

export const search = async (req) => {
  try {
    let { q, type, status, rated, score, season, language, genres, sort, sy, sm, sd, ey, em, ed } = req.query;
    let page = parseInt(req.query.page) || 1;
    
    // Check if the search keyword is in a foreign language and if it can be converted
    q = await convertForeignLanguage(q);

    const [totalPage, data] = await extractSearchResults({
      keyword: q, 
      type: type,
      status: status,
      rated: rated,
      score: score,
      season: season,
      language: language,
      genres: genres,
      sort: sort,
      page: page,
      sy: sy,
      sm: sm,
      sd: sd,
      ey: ey,
      em: em,
      ed: ed,
    });
    if (page > totalPage) {
      const error = new Error("Requested page exceeds total available pages.");
      error.status = 404;
      throw error;
    }

    // Fetch most popular animes
    const mostPopularAnimes = await extractPage(1, "most-popular");

    const searchFilters = {
      type,
      status,
      rated,
      score,
      season,
      language,
      genres,
      sort,
      sy,
      sm,
      sd,
      ey,
      em,
      ed,
    };

    return {
      animes: data,
      mostPopularAnimes: mostPopularAnimes[0] || [],
      searchQuery: q || "",
      searchFilters,
      totalPages: totalPage,
      hasNextPage: page < totalPage,
      currentPage: page,
    };
  } catch (e) {
    console.error(e);
    if (e.status === 404) {
      throw e;
    }
    throw new Error("An error occurred while processing your request.");
  }
};
