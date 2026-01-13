import extractSchedule from "../extractors/schedule.extractor.js";

export const getSchedule = async (req) => {
  const date = req.query.date || new Date().toISOString().split("T")[0];
  const tzOffset = req.query.tzOffset || -330;
  try {
    const data = await extractSchedule(date, tzOffset);
    return { scheduledAnimes: data };
  } catch (e) {
    console.error(e);
    return e;
  }
};
