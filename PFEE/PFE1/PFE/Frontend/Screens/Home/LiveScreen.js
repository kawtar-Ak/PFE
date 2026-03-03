import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { matchService } from "../../services/matchService";
import { favoritesService } from "../../services/favoritesService";

export default function LiveScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [expandedLeagues, setExpandedLeagues] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      const favs = await favoritesService.getFavorites();
      setFavorites(Array.isArray(favs) ? favs : []);
    } catch (e) {
      console.error("Erreur chargement favoris:", e);
    }
  };

  const loadLiveMatches = async () => {
    try {
      const all = await matchService.getAllMatches();
      const list = Array.isArray(all) ? all : [];

      // ✅ backend: scheduled | live | finished
      const liveOrSoon = list.filter((m) => {
        const s = String(m.status || "").toLowerCase();
        return s === "live" || s === "scheduled";
      });

      // tri par date (prochain / live en haut)
      liveOrSoon.sort((a, b) => new Date(a.date) - new Date(b.date));

      setMatches(liveOrSoon);

      const leagues = {};
      liveOrSoon.forEach((m) => {
        if (m?.league) leagues[m.league] = true;
      });
      setExpandedLeagues(leagues);
    } catch (e) {
      console.error("Erreur lors du chargement des matches:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveMatches();
    loadFavorites();

    // ✅ refresh auto 60s
    const interval = setInterval(() => {
      loadLiveMatches();
    }, 60 * 1000);

    // ✅ refresh favoris instantané
    const unsubFav = favoritesService.subscribe(() => {
      loadFavorites();
    });

    return () => {
      clearInterval(interval);
      unsubFav?.();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([loadLiveMatches(), loadFavorites()]).finally(() => {
      setRefreshing(false);
    });
  };

  const toggleLeague = (leagueName) => {
    setExpandedLeagues((prev) => ({
      ...prev,
      [leagueName]: !prev[leagueName],
    }));
  };

  const grouped = useMemo(() => {
    const byLeague = {};
    matches.forEach((m) => {
      const league = m.league || "Autre";
      if (!byLeague[league]) byLeague[league] = [];
      byLeague[league].push(m);
    });

    return Object.entries(byLeague)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([league, leagueMatches]) => {
        const show = expandedLeagues[league] !== false;
        return { title: league, data: show ? leagueMatches : [] };
      });
  }, [matches, expandedLeagues]);

  const renderSectionHeader = ({ section: { title } }) => (
    <TouchableOpacity style={styles.leagueHeader} onPress={() => toggleLeague(title)} activeOpacity={0.9}>
      <View style={styles.leagueHeaderLeft}>
        <Ionicons
          name={expandedLeagues[title] ? "chevron-down" : "chevron-forward"}
          size={20}
          color="#ef4444"
        />
        <Text style={styles.leagueTitle} numberOfLines={1}>{title}</Text>
      </View>
      <Text style={styles.leagueCount}>
        {matches.filter((m) => (m.league || "Autre") === title).length}
      </Text>
    </TouchableOpacity>
  );

  const renderMatch = ({ item }) => {
    const matchDate = new Date(item.date);
    const timeStr = matchDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    const status = String(item.status || "").toLowerCase();
    const isLive = status === "live";
    const isFinished = status === "finished";

    let statusIcon = "🕐";
    let statusText = "À VENIR";
    let badgeColor = "#1e293b";
    let textColor = "#94a3b8";
    let borderColor = "#64748b";
    let scoreColor = "#fff";

    if (isLive) {
      statusIcon = "🔴";
      statusText = "LIVE";
      badgeColor = "#7f1d1d";
      textColor = "#ef4444";
      borderColor = "#ef4444";
      scoreColor = "#ef4444";
    } else if (isFinished) {
      statusIcon = "✓";
      statusText = "TERMINÉ";
      badgeColor = "#0d3b0d";
      textColor = "#10b981";
      borderColor = "#10b981";
      scoreColor = "#fff";
    }

    const isFavorite = favorites.some((fav) => fav?._id === item._id);

    const handleToggleFavorite = async () => {
      await favoritesService.toggleFavorite(item);
      await loadFavorites();
    };

    const goToDetails = () => {
      navigation?.getParent?.()?.navigate("MatchDetails", { match: item });
    };

    return (
      <TouchableOpacity activeOpacity={0.92} onPress={goToDetails} style={[styles.matchCard, { borderLeftColor: borderColor }]}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchTime}>{timeStr}</Text>

          <View style={styles.matchRightSection}>
            <View style={[styles.liveBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.livePulse}>{statusIcon}</Text>
              <Text style={[styles.liveText, { color: textColor }]}>{statusText}</Text>
            </View>

            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton} activeOpacity={0.85}>
              <Ionicons
                name={isFavorite ? "star" : "star-outline"}
                size={20}
                color={isFavorite ? "#ef4444" : "#94a3b8"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.matchContent}>
          <View style={styles.teamSection}>
            <Text style={styles.teamName} numberOfLines={1}>{item.homeTeam}</Text>
          </View>

          <View style={styles.scoreSection}>
            <Text style={[styles.score, { color: scoreColor }]}>{isLive || isFinished ? (item.homeScore ?? "-") : "-"}</Text>
            <Text style={styles.scoreSeparator}>-</Text>
            <Text style={[styles.score, { color: scoreColor }]}>{isLive || isFinished ? (item.awayScore ?? "-") : "-"}</Text>
          </View>

          <View style={styles.teamSection}>
            <Text style={styles.teamName} numberOfLines={1}>{item.awayTeam}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches en direct</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const hasLive = matches.some((m) => String(m.status || "").toLowerCase() === "live");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.title}>Matches en direct</Text>
          {hasLive ? <Text style={styles.liveDot}>●</Text> : null}
        </View>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="radio-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>Aucun match en direct</Text>
        </View>
      ) : (
        <SectionList
          sections={grouped}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderMatch}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#ef4444" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  liveDot: { color: "#ef4444", fontSize: 18, marginTop: 2 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#94a3b8", fontSize: 16 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 12, color: "#94a3b8", fontSize: 16 },

  listContent: { paddingVertical: 8 },

  leagueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  leagueHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  leagueTitle: { fontSize: 15, fontWeight: "700", color: "#fff", flex: 1 },
  leagueCount: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: "700",
  },

  matchCard: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    borderLeftWidth: 4,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  matchRightSection: { flexDirection: "row", alignItems: "center", gap: 8 },
  favoriteButton: { padding: 4 },
  matchTime: { fontSize: 14, fontWeight: "700", color: "#fff" },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  livePulse: { fontSize: 14 },
  liveText: { fontSize: 12, fontWeight: "900" },

  matchContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  teamSection: { flex: 1 },
  teamName: { fontSize: 12, fontWeight: "700", color: "#e2e8f0" },

  scoreSection: { flexDirection: "row", alignItems: "center", justifyContent: "center", minWidth: 72 },
  score: { fontSize: 18, fontWeight: "900" },
  scoreSeparator: { fontSize: 12, color: "#64748b", marginHorizontal: 8, fontWeight: "900" },
});