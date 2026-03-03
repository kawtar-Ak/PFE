import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    const matchesData = await matchService.getAllMatches();
    setMatches(matchesData);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const matchesData = await matchService.getAllMatches();
    setMatches(matchesData);
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'live': return '#ef4444';
      case 'finished': return '#60A3D9';
      case 'scheduled': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'live': return '🔴 LIVE';
      case 'finished': return '✓ FT';
      case 'scheduled': return '🕐';
      default: return status;
    }
  };

  const renderMatch = ({ item }) => (
    <View style={styles.matchCard}>
      <View style={[styles.statusBar, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusLabel}>{getStatusLabel(item.status)}</Text>
        <Text style={styles.leagueName}>{item.league}</Text>
      </View>

      <View style={styles.matchContent}>
        <View style={styles.dateSection}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          {item.status === 'scheduled' && (
            <Text style={styles.time}>{formatTime(item.date)}</Text>
          )}
        </View>

        <View style={styles.teamSection}>
          <Text style={styles.teamName}>{item.homeTeam}</Text>
        </View>

        <View style={styles.scoreSection}>
          {item.status === 'scheduled' ? (
            <Text style={styles.timeDisplay}>{formatTime(item.date)}</Text>
          ) : (
            <Text style={styles.score}>
              {item.homeScore ?? '-'} - {item.awayScore ?? '-'}
            </Text>
          )}
        </View>

        <View style={styles.teamSection}>
          <Text style={styles.teamName}>{item.awayTeam}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="football-outline" size={24} color="#E0F2FE" />
          <Text style={styles.headerTitle}>Matches</Text>
        </View>
        <TouchableOpacity onPress={loadMatches}>
          <Ionicons name="refresh" size={24} color="#E0F2FE" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#60A3D9" />
          <Text style={styles.loadingText}>Chargement des matches...</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>Aucun match disponible</Text>
          <Text style={styles.emptySubtext}>Importez les matches depuis l'API</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item._id}
          renderItem={renderMatch}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#E0F2FE',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14
  },
  emptyText: {
    color: '#E0F2FE',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16
  },
  emptySubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8
  },
  listContent: {
    padding: 12
  },
  matchCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  statusLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  leagueName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  matchContent: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  dateSection: {
    width: 45,
    alignItems: 'center'
  },
  date: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  time: {
    color: '#60A3D9',
    fontSize: 10,
    marginTop: 2
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8
  },
  teamName: {
    color: '#E0F2FE',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  scoreSection: {
    width: 50,
    alignItems: 'center'
  },
  score: {
    color: '#E0F2FE',
    fontSize: 16,
    fontWeight: 'bold'
  },
  timeDisplay: {
    color: '#60A3D9',
    fontSize: 12,
    fontWeight: '600'
  }
});
