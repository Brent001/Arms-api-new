import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export default async function extractSchedule(date, tzOffset) {
  try {  
    tzOffset = tzOffset ?? -330;

    const resp = await axios.get(
      `https://${v1_base_url}/ajax/schedule/list?tzOffset=${tzOffset}&date=${date}`
    );
    const $ = cheerio.load(resp.data.html);
    const results = [];

    $("li").each((i, element) => {
      const id = $(element)
        ?.find("a")
        .attr("href")
        .split("?")[0]
        .replace("/", "");
      const title = $(element).find(".film-name").text().trim();
      const japanese_title = $(element)
        .find(".film-name")
        .attr("data-jname")
        ?.trim();
      const time = $(element).find(".time").text().trim();
      const episode_no = $(element)
        ?.find(".btn-play")
        .text()
        .trim()
        .split(" ")
        .pop();

      // Compute airing timestamp
      const airingTimestamp = new Date(`${date}T${time}:00`).getTime() - tzOffset * 60 * 1000;
      const secondsUntilAiring = Math.floor((airingTimestamp - Date.now()) / 1000);

      results.push({
        id,
        time,
        name: title,
        jname: japanese_title,
        airingTimestamp,
        secondsUntilAiring,
        episode: parseInt(episode_no) || 0,
      });
    });

    return results;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}
