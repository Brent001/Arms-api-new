import getSuggestion from "../extractors/suggestion.extractor.js";
import convertForeignLanguage from "../helper/foreignInput.helper.js";

export const getSuggestions = async (req) => {
  let { q } = req.query;

  // Check if the search keyword is in a foreign language and if it can be converted
  q = await convertForeignLanguage(q);

  try {
    const data = await getSuggestion(encodeURIComponent(q));
    const suggestions = data.map(item => ({
      id: item.id,
      name: item.title,
      jname: item.japanese_title,
      poster: item.poster,
      moreInfo: [item.releaseDate, item.showType, item.duration]
    }));
    return { suggestions };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
};
