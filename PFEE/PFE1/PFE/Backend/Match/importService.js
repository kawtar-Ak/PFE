// Backend/Match/importService.js

// ✅ fetch compatible Node < 18
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const Match = require("./MatchModel");

// API football-data.org
const FOOTBALL_DATA_API = "https://api.football-data.org/v4";
const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_KEY;

// Ligues supportées
const LEAGUES = {
  PL: "Premier League",
  PD: "La Liga",
  SA: "Serie A",
  BL1: "Bundesliga",
  FL1: "Ligue 1",
  PPL: "Primeira Liga",
  DED: "Eredivisie",
  CL: "Champions League",
  EL: "Europa League",
};

// ✅ Statuts officiels football-data v4
const STATUS_QUERY = [
  "SCHEDULED",
  "TIMED",
  "IN_PLAY",
  "PAUSED",
  "EXTRA_TIME",
  "PENALTY_SHOOTOUT",
  "FINISHED",
].join(",");

const statusMap = {
  SCHEDULED: "scheduled",
  TIMED: "scheduled",
  IN_PLAY: "live",
  PAUSED: "live",
  EXTRA_TIME: "live",
  PENALTY_SHOOTOUT: "live",
  FINISHED: "finished",
};

const fetchLeagueMatches = async (leagueCode) => {
  try {
    if (!FOOTBALL_DATA_KEY) {
      console.warn("⚠️ FOOTBALL_DATA_KEY not configured.");
      return [];
    }

    const url = `${FOOTBALL_DATA_API}/competitions/${leagueCode}/matches?status=${STATUS_QUERY}`;
    const response = await fetch(url, {
      headers: { "X-Auth-Token": FOOTBALL_DATA_KEY },
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      console.error(
        `❌ API error ${response.status}: ${response.statusText} ${txt}`
      );
      return [];
    }

    const data = await response.json();
    return data?.matches || [];
  } catch (error) {
    console.error(`❌ Error fetching matches for ${leagueCode}:`, error.message);
    return [];
  }
};

const pickScore = (match) => {
  const ft = match?.score?.fullTime || {};
  const ht = match?.score?.halfTime || {};

  const home = ft.home ?? ht.home ?? null;
  const away = ft.away ?? ht.away ?? null;

  return { home, away };
};

const transformMatch = (match, leagueName) => {
  const { home, away } = pickScore(match);

  return {
    apiMatchId: match.id, // ✅ id stable
    homeTeam: match?.homeTeam?.name || "Unknown",
    awayTeam: match?.awayTeam?.name || "Unknown",
    homeScore: home,
    awayScore: away,
    date: new Date(match.utcDate),
    league: leagueName,
    status: statusMap[match.status] || "scheduled",
    updatedAt: new Date(),
  };
};

// ✅ UPSERT: update si existe, insert sinon
const upsertMatches = async (list) => {
  let count = 0;

  for (const item of list) {
    if (!item?.apiMatchId) continue;

    await Match.updateOne(
      { apiMatchId: item.apiMatchId },
      { $set: item },
      { upsert: true }
    );

    count += 1;
  }

  return count;
};

// Importer une seule ligue
const importLeagueMatches = async (leagueCode) => {
  try {
    const leagueName = LEAGUES[leagueCode];
    if (!leagueName) {
      return { success: false, message: "League not found", count: 0 };
    }

    if (!FOOTBALL_DATA_KEY) {
      return { success: false, message: "API key not configured", count: 0 };
    }

    console.log(`📥 Refresh ${leagueName}...`);
    const matches = await fetchLeagueMatches(leagueCode);

    const transformed = matches
      .filter(
        (m) => m?.id && m?.homeTeam?.name && m?.awayTeam?.name && m?.utcDate
      )
      .map((m) => transformMatch(m, leagueName));

    if (transformed.length === 0) {
      return {
        success: true,
        message: `No matches for ${leagueName}`,
        count: 0,
        league: leagueName,
      };
    }

    const upserted = await upsertMatches(transformed);

    return {
      success: true,
      message: `Upserted ${upserted} matches for ${leagueName}`,
      count: upserted,
      league: leagueName,
    };
  } catch (error) {
    console.error("❌ importLeagueMatches error:", error);
    return { success: false, message: error.message, count: 0 };
  }
};

// Importer toutes les ligues
const importAllMatches = async () => {
  try {
    console.log("🔄 Refreshing matches from football-data.org...");

    if (!FOOTBALL_DATA_KEY) {
      return {
        success: false,
        message: "FOOTBALL_DATA_KEY not configured",
        count: 0,
      };
    }

    let total = 0;

    for (const [code, name] of Object.entries(LEAGUES)) {
      console.log(`📥 Refresh ${name}...`);
      const matches = await fetchLeagueMatches(code);

      const transformed = matches
        .filter(
          (m) => m?.id && m?.homeTeam?.name && m?.awayTeam?.name && m?.utcDate
        )
        .map((m) => transformMatch(m, name));

      const upserted = await upsertMatches(transformed);
      total += upserted;

      console.log(`✅ ${name}: upserted ${upserted}`);
    }

    return {
      success: true,
      message: `Upserted ${total} matches`,
      count: total,
    };
  } catch (error) {
    console.error("❌ importAllMatches error:", error);
    return {
      success: false,
      message: error.message,
      count: 0,
    };
  }
};

const getSupportedLeagues = () => {
  return Object.entries(LEAGUES).map(([code, name]) => ({ code, name }));
};

module.exports = {
  importAllMatches,
  importLeagueMatches,
  getSupportedLeagues,
  LEAGUES,
};