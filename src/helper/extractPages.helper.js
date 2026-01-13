import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";
import { DEFAULT_HEADERS } from "../configs/header.config.js";

const axiosInstance = axios.create({ headers: DEFAULT_HEADERS });

async function extractPage(page, params) {
  try {
    // CRITICAL: Validate params FIRST
    if (!params || params === 'undefined' || typeof params !== 'string') {
      console.error('❌ INVALID PARAMS:', {
        params,
        type: typeof params,
        page,
        stack: new Error().stack
      });
      throw new Error(`Invalid params: "${params}" (type: ${typeof params}). Must be a valid string.`);
    }

    // Validate page
    const pageNum = parseInt(page, 10);
    if (!pageNum || pageNum < 1) {
      console.warn('⚠️  Invalid page, defaulting to 1:', page);
      page = 1;
    }

    // Construct URL
    const url = `https://${v1_base_url}/${params}?page=${page}`;
    console.log(`✅ Fetching: ${url}`);
    
    const resp = await axiosInstance.get(url);
    
    // Check for 404 page
    if (resp.data.includes('404 Error') || resp.status === 404) {
      throw new Error(`404: Endpoint "${params}" not found at ${url}`);
    }
    
    const $ = cheerio.load(resp.data);
    
    const totalPages = Number(
      $('.pre-pagination nav .pagination > .page-item a[title="Last"]')
        ?.attr("href")
        ?.split("=")
        .pop() ??
      $('.pre-pagination nav .pagination > .page-item a[title="Next"]')
        ?.attr("href")
        ?.split("=")
        .pop() ??
      $(".pre-pagination nav .pagination > .page-item.active a")
        ?.text()
        ?.trim()
    ) || 1;
      
    const contentSelector = params.includes("az-list")
      ? ".tab-content"
      : "#main-content";
    
    const items = $(`${contentSelector} .film_list-wrap .flw-item`);
    
    if (items.length === 0) {
      console.warn(`⚠️  No items found for: ${params}, page: ${page}`);
      return [[], totalPages];
    }
    
    const data = await Promise.all(
      items.map(async (index, element) => {
        const $fdiItems = $(".film-detail .fd-infor .fdi-item", element);
        const showType = $fdiItems
          .filter((_, item) => {
            const text = $(item).text().trim().toLowerCase();
            return ["tv", "ona", "movie", "ova", "special", "music"].some((type) =>
              text.includes(type)
            );
          })
          .first();
          
        const poster = $(".film-poster>img", element).attr("data-src");
        const title = $(".film-detail .film-name", element).text();
        const japanese_title = $(".film-detail>.film-name>a", element).attr("data-jname");
        const description = $(".film-detail .description", element).text().trim();
        const data_id = $(".film-poster>a", element).attr("data-id");
        const id = $(".film-poster>a", element).attr("href")?.split("/").pop();
        
        const tvInfo = {
          showType: showType ? showType.text().trim() : "Unknown",
          duration: $(".film-detail .fd-infor .fdi-duration", element).text().trim(),
        };
        
        let adultContent = false;
        const tickRateText = $(".film-poster>.tick-rate", element).text().trim();
        if (tickRateText.includes("18+")) {
          adultContent = true;
        }

        ["sub", "dub", "eps"].forEach((property) => {
          const value = $(`.tick .tick-${property}`, element).text().trim();
          if (value) {
            tvInfo[property] = value;
          }
        });
        
        let result = { id, name: title, jname: japanese_title, poster };
        
        // Add fields for category params
        if (params.startsWith("genre/") || params.startsWith("producer/") || ["tv", "movie", "ova", "special", "ona"].includes(params)) {
          result.duration = tvInfo.duration;
          result.type = tvInfo.showType;
          result.rating = adultContent ? "18+" : null;
          result.episodes = { 
            sub: tvInfo.sub ? parseInt(tvInfo.sub) : null, 
            dub: tvInfo.dub ? parseInt(tvInfo.dub) : null 
          };
        }
        
        if (params === "recently-updated" || params === "recently-added") {
          result.duration = tvInfo.duration;
          result.type = tvInfo.showType;
          result.rating = adultContent ? "18+" : null;
          result.episodes = { 
            sub: tvInfo.sub ? parseInt(tvInfo.sub) : null, 
            dub: tvInfo.dub ? parseInt(tvInfo.dub) : null 
          };
        } else if (params === "top-upcoming") {
          result.duration = tvInfo.duration;
          result.type = tvInfo.showType + " (? eps)";
          result.rating = null;
          result.episodes = { sub: null, dub: null };
        } else if (params === "top-airing" || params === "most-popular" || params === "most-favorite" || params === "completed") {
          result.episodes = { 
            sub: tvInfo.sub ? parseInt(tvInfo.sub) : null, 
            dub: tvInfo.dub ? parseInt(tvInfo.dub) : null 
          };
          result.type = tvInfo.showType;
        }
        return result;
      }).get() // IMPORTANT: Convert cheerio object to array
    );
    
    console.log(`✅ Success: ${params}, page ${page}, ${data.length} items`);
    return [data, parseInt(totalPages, 10)];
    
  } catch (error) {
    console.error(`❌ extractPage ERROR:`, {
      params,
      page,
      message: error.message,
      url: error.config?.url,
      status: error.response?.status
    });
    throw error;
  }
}

export default extractPage;