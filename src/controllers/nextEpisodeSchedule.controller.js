import extractNextEpisodeSchedule from "../extractors/getNextEpisodeSchedule.extractor.js";

export const getNextEpisodeSchedule = async (req) => {
  const { id } = req.params;
  try {
    const nextEpisodeSchedule = await extractNextEpisodeSchedule(id);
    if (!nextEpisodeSchedule) {
      return {
        airingISOTimestamp: null,
        airingTimestamp: null,
        secondsUntilAiring: null
      };
    }
    // Parse the date string assuming format "YYYY-MM-DD HH:MM:SS" in UTC
    const date = new Date(nextEpisodeSchedule + 'Z'); // Add Z to treat as UTC
    const now = Date.now();
    const airingTimestamp = date.getTime();
    const secondsUntilAiring = Math.floor((airingTimestamp - now) / 1000);
    return {
      airingISOTimestamp: date.toISOString(),
      airingTimestamp,
      secondsUntilAiring
    };
  } catch (e) {
    console.error(e);
    throw new Error(e.message);
  }
};
