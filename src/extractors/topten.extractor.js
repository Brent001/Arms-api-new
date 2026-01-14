import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractTopTen() {
  try {
    const resp = await axios.get(`https://${v1_base_url}/home`);
    const $ = cheerio.load(resp.data);

    const labels = ["today", "week", "month"];
    const result = {};

    labels.forEach((label, idx) => {
      const data = $(
        `#main-sidebar .block_area-realtime .block_area-content ul:eq(${idx})>li`
      )
        .map((index, element) => {
          const rank = parseInt($(".film-number>span", element).text().trim()) || index + 1;
          const name = $(".film-detail>.film-name>a", element).text().trim();
          const poster = $(".film-poster>img", element).attr("data-src");
          const japanese_title = $(".film-detail>.film-name>a", element)
            .attr("data-jname")
            .trim();
          const data_id = $(".film-poster", element).attr("data-id");
          const id = $(".film-detail>.film-name>a", element)
            .attr("href")
            .split("/")
            .pop();
          
          const episodes = {
            sub: parseInt($(`.tick .tick-sub`, element).text().trim()) || 0,
            dub: parseInt($(`.tick .tick-dub`, element).text().trim()) || 0,
          };

          return { 
            id, 
            name, 
            poster, 
            rank,
            episodes 
          };
        })
        .get();

      result[label] = data;
    });

    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export default extractTopTen;