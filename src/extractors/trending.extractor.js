import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function fetchAnimeDetails(element, index) {
  const data_id = element.attr("data-id");
  const poster = element.find("img").attr("data-src");
  const name = element.find(".film-title").text().trim();
  const japanese_title = element.find(".film-title").attr("data-jname").trim();
  const id = element.find("a").attr("href").split("/").pop();
  
  return { 
    id, 
    name, 
    poster, 
    rank: index + 1 
  };
}

async function extractTrending() {
  try {
    const resp = await axios.get(`https://${v1_base_url}/home`);
    const $ = cheerio.load(resp.data);

    const trendingElements = $("#anime-trending #trending-home .swiper-slide");
    const elementPromises = trendingElements
      .map((index, element) => {
        return fetchAnimeDetails($(element), index);
      })
      .get();

    const trendingData = await Promise.all(elementPromises);
    return JSON.parse(JSON.stringify(trendingData));
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return error;
  }
}

export default extractTrending;