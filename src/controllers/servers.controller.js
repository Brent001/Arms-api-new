import { extractServers } from "../extractors/streamInfo.extractor.js";

export const getServers = async (req) => {
  try {
    const { animeEpisodeId } = req.query;
    const ep = animeEpisodeId.split('?ep=').pop();
    const servers = await extractServers(ep);
    
    // Group servers by type
    const grouped = {
      sub: [],
      dub: [],
      raw: []
    };
    
    servers.forEach(server => {
      const type = server.type.toLowerCase();
      if (grouped[type]) {
        grouped[type].push({
          serverName: server.serverName,
          serverId: server.server_id
        });
      }
    });
    
    return {
      sub: grouped.sub,
      dub: grouped.dub,
      raw: grouped.raw,
      episodeId: animeEpisodeId,
      episodeNo: 1 // Placeholder, adjust if needed
    };
  } catch (e) {
    console.error(e);
    return e;
  }
};
