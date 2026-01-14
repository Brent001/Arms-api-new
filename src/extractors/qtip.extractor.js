import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export default async function extractQtip(id) {
  try {
    const dataId = id.split("-").pop();
    const resp = await axios.get(
      `https://${v1_base_url}/ajax/movie/qtip/${dataId}`,
      {
        headers: {
          "x-requested-with": "XMLHttpRequest",
        },
      }
    );
    const $ = cheerio.load(resp.data);
    const selector = ".pre-qtip-content";

    const title = $(`${selector} .pre-qtip-title`).text();
    const rating = $(`${selector} .pre-qtip-detail`).children().first().text().trim();
    const quality = $(`${selector} .tick .tick-quality`).text();
    const subCount = $(`${selector} .tick .tick-sub`).text().trim();
    const dubCount = $(`${selector} .tick .tick-dub`).text().trim();
    const type = $(`${selector} .badge.badge-quality`).text();
    const description = $(`${selector} .pre-qtip-description`).text().trim();
    const japaneseTitle = $(`${selector} .pre-qtip-line:contains('Japanese:') .stick-text`)
      .text()
      .trim();
    const airedDate = $(`${selector} .pre-qtip-line:contains('Aired:') .stick-text`)
      .text()
      .trim();
    const status = $(`${selector} .pre-qtip-line:contains('Status:') .stick-text`)
      .text()
      .trim();
    const Synonyms = $(`${selector} .pre-qtip-line:contains('Synonyms:') .stick-text`)
      .text()
      .trim();
    const genres = [];
    $(`${selector} .pre-qtip-line:contains('Genres:') a`).each((i, elem) => {
      genres.push($(elem).text().trim().split(" ").join("-"));
    });
    
    const watchLink = $(".pre-qtip-button a.btn.btn-play").attr("href");

    const extractedData = {
      id,
      name: title,
      malscore: rating,
      quality,
      episodes: {
        sub: subCount ? parseInt(subCount) : null,
        dub: dubCount ? parseInt(dubCount) : null,
      },
      type,
      description,
      jname: japaneseTitle,
      synonyms: Synonyms,
      aired: airedDate,
      status,
      genres,
    };
    return extractedData;
  } catch (error) {
    console.error("Error extracting data:", error);
    return error;
  }
}
