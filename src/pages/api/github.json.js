export const prerender = false;

export async function GET({ request }) {
  // 1. Get environment variables
  const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  const username = 'Sajinomoto';

  const headers = {
    "User-Agent": "Astro-Portfolio-Agent",
    "Accept": "application/vnd.github.v3+json"
  };

  // Add authorization header if token is available and configured
  if (GITHUB_TOKEN && !GITHUB_TOKEN.includes("your_github_token")) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  }

  // 2. Origin & Referer Verification for Security
  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";
  const urlObj = new URL(request.url);
  const host = urlObj.host;

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
    // 3. Fetch data from GitHub APIs in parallel
    const [profileRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers }),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=15`, { headers })
    ]);

    if (!profileRes.ok) {
      throw new Error(`GitHub Profile API returned status ${profileRes.status}`);
    }

    const profileData = await profileRes.json();
    const reposData = reposRes.ok ? await reposRes.json() : [];
    const eventsData = eventsRes.ok ? await eventsRes.json() : [];

    // 4. Process Language Distribution (By Repository Count to avoid binary size bias)
    let languages = [];
    if (Array.isArray(reposData)) {
      const langCounts = {};
      let totalCount = 0;

      reposData.forEach(repo => {
        if (repo.language) {
          const lang = repo.language;
          langCounts[lang] = (langCounts[lang] || 0) + 1;
          totalCount += 1;
        }
      });

      languages = Object.entries(langCounts)
        .map(([name, count]) => ({
          name,
          percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
        }))
        .filter(l => l.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5); // Take top 5 languages
    }

    // 5. Process Public Events
    let events = [];
    if (Array.isArray(eventsData)) {
      events = eventsData.slice(0, 5).map(e => ({
        id: e.id,
        type: e.type,
        repo: e.repo.name,
        created_at: e.created_at,
        payload: {
          action: e.payload?.action || null
        }
      }));
    }

    // 6. Compile response
    const dataResponse = {
      stats: {
        name: profileData.name,
        login: profileData.login,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        html_url: profileData.html_url,
        public_repos: profileData.public_repos,
        followers: profileData.followers,
        following: profileData.following,
        created_at: profileData.created_at
      },
      languages,
      events
    };

    return new Response(JSON.stringify(dataResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=59"
      }
    });

  } catch (error) {
    console.error("Error in GitHub serverless API endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "GitHub API Integration Error",
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
