import * as homeInfoController from "../controllers/homeInfo.controller.js";
import * as categoryController from "../controllers/category.controller.js";
import * as topTenController from "../controllers/topten.controller.js";
import * as animeInfoController from "../controllers/animeInfo.controller.js";
import * as streamController from "../controllers/streamInfo.controller.js";
import * as searchController from "../controllers/search.controller.js";
import * as episodeListController from "../controllers/episodeList.controller.js";
import * as suggestionsController from "../controllers/suggestion.controller.js";
import * as scheduleController from "../controllers/schedule.controller.js";
import * as serversController from "../controllers/servers.controller.js";
import * as randomController from "../controllers/random.controller.js";
import * as qtipController from "../controllers/qtip.controller.js";
import * as randomIdController from "../controllers/randomId.controller.js";
import * as producerController from "../controllers/producer.controller.js";
import * as characterListController from "../controllers/voiceactor.controller.js";
import * as nextEpisodeScheduleController from "../controllers/nextEpisodeSchedule.controller.js";
import { routeTypes } from "./category.route.js";
import { getWatchlist } from "../controllers/watchlist.controller.js";
import getVoiceActors from "../controllers/actors.controller.js";
import getCharacter from "../controllers/characters.controller.js";
import * as filterController from "../controllers/filter.controller.js";
import getTopSearch from "../controllers/topsearch.controller.js";

export const createApiRoutes = (app, jsonResponse, jsonError) => {
  const createRoute = (path, controllerMethod) => {
    app.get(path, async (req, res) => {
      try {
        const data = await controllerMethod(req, res);
        if (!res.headersSent) {
          return jsonResponse(res, data);
        }
      } catch (err) {
        console.error(`Error in route ${path}:`, err);
        if (!res.headersSent) {
          return jsonError(res, err.message || "Internal server error");
        }
      }
    });
  };

  ["/api/v2/hianime/home", "/api/v2/hianime/home/"].forEach((route) => {
    app.get(route, async (req, res) => {
      try {
        const data = await homeInfoController.getHomeInfo(req, res);
        if (!res.headersSent) {
          return jsonResponse(res, data);
        }
      } catch (err) {
        console.error("Error in home route:", err);
        if (!res.headersSent) {
          return jsonError(res, err.message || "Internal server error");
        }
      }
    });
  });

  createRoute("/api/v2/hianime/genre/:genreName", (req, res) =>
    categoryController.getCategory(req, res, `genre/${req.params.genreName}`)
  );

  createRoute("/api/v2/hianime/category/:categoryName", (req, res) =>
    categoryController.getCategory(req, res, req.params.categoryName)
  );

  routeTypes
    .filter((routeType) => !routeType.startsWith("genre/"))
    .forEach((routeType) =>
      createRoute(`/api/v2/hianime/${routeType}`, (req, res) =>
        categoryController.getCategory(req, res, routeType)
      )
    );

  createRoute("/api/v2/hianime/top-ten", topTenController.getTopTen);
  createRoute("/api/v2/hianime/anime/:id", animeInfoController.getAnimeInfo);
  createRoute("/api/v2/hianime/anime/:id/episodes", episodeListController.getEpisodes);
  createRoute("/api/v2/hianime/episode/servers", serversController.getServers);
  createRoute("/api/v2/hianime/episode/sources", (req, res) => streamController.getStreamInfo(req, res, false));
  createRoute("/api/v2/hianime/episode/sources/fallback", (req, res) => streamController.getStreamInfo(req, res, true));
  createRoute("/api/v2/hianime/search", searchController.search);
  createRoute("/api/v2/hianime/filter", filterController.filter);
  createRoute("/api/v2/hianime/search/suggestion", suggestionsController.getSuggestions);
  createRoute("/api/v2/hianime/schedule", scheduleController.getSchedule);
  createRoute(
    "/api/v2/hianime/anime/:id/next-episode-schedule",
    nextEpisodeScheduleController.getNextEpisodeSchedule
  );
  createRoute("/api/v2/hianime/random", randomController.getRandom);
  createRoute("/api/v2/hianime/random/id", randomIdController.getRandomId);
  createRoute("/api/v2/hianime/qtip/:id", qtipController.getQtip);
  createRoute("/api/v2/hianime/producer/:id", producerController.getProducer);
  createRoute(
    "/api/v2/hianime/character/list/:id",
    characterListController.getVoiceActors
  );
  createRoute("/api/v2/hianime/watchlist/:userId{/:page}", getWatchlist);
  createRoute("/api/v2/hianime/actors/:id", getVoiceActors);
  createRoute("/api/v2/hianime/character/:id", getCharacter);
  createRoute("/api/v2/hianime/top-search", getTopSearch);
};
