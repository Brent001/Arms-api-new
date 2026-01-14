import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractSpotlights() {
  try {
    const resp = await axios.get(`https://${v1_base_url}/home`);
    const $ = cheerio.load(resp.data);

    const slideElements = $(
      "div.deslide-wrap > div.container > div#slider > div.swiper-wrapper > div.swiper-slide"
    );

    const promises = slideElements
      .map(async (ind, ele) => {
        const poster = $(ele)
          .find(
            "div.deslide-item > div.deslide-cover > div.deslide-cover-img > img.film-poster-img"
          )
          .attr("data-src");
        const name = $(ele)
          .find(
            "div.deslide-item > div.deslide-item-content > div.desi-head-title"
          )
          .text()
          .trim();
        const jname = $(ele)
          .find(
            "div.deslide-item > div.deslide-item-content > div.desi-head-title"
          )
          .attr("data-jname")
          .trim();
        const description = $(ele)
          .find(
            "div.deslide-item > div.deslide-item-content > div.desi-description"
          )
          .text()
          .trim();
        const id = $(ele)
          .find(
            ".deslide-item > .deslide-item-content > .desi-buttons > a:eq(0)"
          )
          .attr("href")
          .split("/")
          .pop();
        const data_id = $(ele)
          .find(
            ".deslide-item > .deslide-item-content > .desi-buttons > a:eq(0)"
          )
          .attr("href")
          .split("/")
          .pop()
          .split("-")
          .pop();
        const tvInfoMapping = {
          0: "showType",
          1: "duration",
          2: "releaseDate",
          3: "quality",
          4: "episodeInfo",
        };

        const tvInfo = {};

        await Promise.all(
          $(ele)
            .find("div.sc-detail > div.scd-item")
            .map(async (index, element) => {
              const key = tvInfoMapping[index];
              let value = $(element).text().trim().replace(/\n/g, "");

              const tickContainer = $(element).find(".tick");

              if (tickContainer.length > 0) {
                value = {
                  sub: tickContainer.find(".tick-sub").text().trim(),
                  dub: tickContainer.find(".tick-dub").text().trim(),
                };
              }
              tvInfo[key] = value;
            })
        );
        return {
          id: id || "",
          name: name || "",
          jname: jname || "",
          poster: poster || "",
          description: description || "",
          rank: ind + 1,
          otherInfo: [
            tvInfo.showType || "",
            tvInfo.duration || "",
            tvInfo.releaseDate || "",
            tvInfo.quality || "",
          ],
          episodes: {
            sub: (tvInfo.episodeInfo && Number(tvInfo.episodeInfo.sub)) || 0,
            dub: (tvInfo.episodeInfo && Number(tvInfo.episodeInfo.dub)) || 0,
          },
        };
      })
      .get();

    const serverData = await Promise.all(promises);
    return JSON.parse(JSON.stringify(serverData, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return error;
  }
}

export default extractSpotlights;