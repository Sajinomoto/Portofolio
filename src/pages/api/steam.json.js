export const prerender = false;

export async function GET({ request }) {
  // 1. Get environment variables
  // In Astro serverless context, we look at import.meta.env first, then process.env
  const STEAM_API_KEY = import.meta.env.STEAM_API_KEY || process.env.STEAM_API_KEY;
  const STEAM_ID = import.meta.env.STEAM_ID || process.env.STEAM_ID;

  if (!STEAM_API_KEY || !STEAM_ID) {
    console.error("Steam API Error: STEAM_API_KEY or STEAM_ID is not configured in environment variables.");
    return new Response(
      JSON.stringify({
        error: "Configuration Error",
        message: "Steam credentials are not set on the server."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      }
    );
  }

  // 2. Origin & Referer Verification for Security
  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";
  const urlObj = new URL(request.url);
  const host = urlObj.host;

  // Is request allowed? Dev mode bypass, or origin/referer matches host, or localhost
  const isAllowed =
    import.meta.env.DEV ||
    origin.includes(host) ||
    referer.includes(host) ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    referer.includes("localhost") ||
    referer.includes("127.0.0.1");

  if (!isAllowed) {
    return new Response(
      JSON.stringify({ error: "Forbidden", message: "Unauthorized access origin." }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // 3. Fetch Player Summaries
    const playerSummariesUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`;
    const summariesRes = await fetch(playerSummariesUrl);
    if (!summariesRes.ok) {
      throw new Error(`Steam GetPlayerSummaries API returned status ${summariesRes.status}`);
    }
    const summariesData = await summariesRes.json();
    const player = summariesData.response?.players?.[0];

    if (!player) {
      throw new Error("Steam player profile not found.");
    }

    const isOnline = player.personastate > 0 || !!player.gameextrainfo;
    const statusText = isOnline ? "ONLINE" : "OFFLINE";

    // 4. Fetch Owned Games (sorted by playtime to extract Top Played)
    const ownedGamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`;
    const ownedGamesRes = await fetch(ownedGamesUrl);
    if (!ownedGamesRes.ok) {
      throw new Error(`Steam GetOwnedGames API returned status ${ownedGamesRes.status}`);
    }
    const ownedGamesData = await ownedGamesRes.json();
    const games = ownedGamesData.response?.games || [];

    // Sort by playtime_forever descending and take top 3
    const topGames = games
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 3);

        // 5. Fetch achievements for top 3 games in parallel
    const topGamesWithAchievements = await Promise.all(
      topGames.map(async (game) => {
        let achievements = null;
        try {
          const achievementsUrl = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&appid=${game.appid}`;
          const achievementsRes = await fetch(achievementsUrl);
          if (achievementsRes.ok) {
            const achievementsData = await achievementsRes.json();
            if (achievementsData.playerstats?.success) {
              const list = achievementsData.playerstats.achievements || [];
              const total = list.length;
              const unlocked = list.filter((a) => a.achieved === 1).length;
              if (total > 0) {
                achievements = {
                  unlocked,
                  total,
                  percentage: Math.round((unlocked / total) * 100)
                };
              }
            }
          }
        } catch (e) {
          console.warn(`Could not fetch achievements for app ${game.appid}:`, e);
        }

        return {
          appid: game.appid,
          name: game.name,
          playtime_forever: game.playtime_forever,
          playtime_2weeks: game.playtime_2weeks || 0,
          achievements
        };
      })
    );

    // 6. Fetch Recently Played Games
    const recentlyPlayedUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&format=json`;
    const recentlyPlayedRes = await fetch(recentlyPlayedUrl);
    let recentGames = [];
    if (recentlyPlayedRes.ok) {
      const recentlyPlayedData = await recentlyPlayedRes.json();
      recentGames = (recentlyPlayedData.response?.games || []).map((g) => ({
        appid: g.appid,
        name: g.name,
        playtime_2weeks: g.playtime_2weeks,
        playtime_forever: g.playtime_forever
      }));
    }

    // 7. Compile and return response with caching headers
    const dataResponse = {
      profile: {
        personaname: player.personaname,
        avatarfull: player.avatarfull,
        profileurl: player.profileurl,
        statusText,
        isOnline,
        inGameName: player.gameextrainfo || null
      },
      games: topGamesWithAchievements,
      recentGames
    };

    return new Response(JSON.stringify(dataResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=59"
      }
    });

  } catch (error) {
    console.error("Error in Steam serverless API endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Steam API Integration Error",
        message: error.message || "An unexpected error occurred."
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      }
    );
  }
}
