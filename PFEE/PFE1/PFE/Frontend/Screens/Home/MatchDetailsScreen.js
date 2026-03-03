import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MatchDetailsScreen({ route, navigation }) {
  const match = route?.params?.match;

  const matchDate = useMemo(() => {
    if (!match?.date) {
      return null;
    }

    return new Date(match.date);
  }, [match?.date]);

  if (!match) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Match introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.88}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = String(match.status || '').toUpperCase();
  const isLive = status === 'LIVE';
  const isFinished = status === 'FINISHED';

  const statusLabel = isLive ? 'LIVE' : isFinished ? 'TERMINE' : 'A VENIR';
  const scoreHome = isFinished || isLive ? match.homeScore ?? '-' : '-';
  const scoreAway = isFinished || isLive ? match.awayScore ?? '-' : '-';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{match.league || 'Match'}</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLeague}>{match.league || 'Competition'}</Text>
          <Text style={styles.heroDate}>
            {matchDate
              ? matchDate.toLocaleString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Date indisponible'}
          </Text>

          <View style={styles.scoreBoard}>
            <View style={styles.teamColumn}>
              <Text style={styles.teamLabel}>Domicile</Text>
              <Text style={styles.teamName}>{match.homeTeam || 'Equipe locale'}</Text>
            </View>

            <View style={styles.scoreBox}>
              <Text style={[styles.score, isLive && styles.liveScore]}>{scoreHome}</Text>
              <Text style={styles.scoreDivider}>-</Text>
              <Text style={[styles.score, isLive && styles.liveScore]}>{scoreAway}</Text>
            </View>

            <View style={styles.teamColumn}>
              <Text style={styles.teamLabel}>Exterieur</Text>
              <Text style={styles.teamName}>{match.awayTeam || 'Equipe visiteuse'}</Text>
            </View>
          </View>

          <View style={[styles.statusPill, isLive && styles.statusPillLive, isFinished && styles.statusPillFinished]}>
            <Text style={[styles.statusText, isLive && styles.statusTextLive, isFinished && styles.statusTextFinished]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resume du match</Text>
          <InfoRow label="Competition" value={match.league || '-'} />
          <InfoRow label="Date" value={matchDate ? matchDate.toLocaleDateString('fr-FR') : '-'} />
          <InfoRow label="Heure" value={matchDate ? matchDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'} />
          <InfoRow label="Statut" value={statusLabel} />
          <InfoRow label="Score" value={`${scoreHome} - ${scoreAway}`} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <InfoRow label="Pays" value={match.country || '-'} />
          <InfoRow label="Saison" value={match.season?.toString?.() || '-'} />
          <InfoRow label="Stade" value={match.venue || '-'} />
          <InfoRow label="Ville" value={match.city || '-'} />
          <InfoRow label="Arbitre" value={match.referee || '-'} />
          <InfoRow label="Tour" value={match.round || '-'} />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B16',
  },
  topBar: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1220',
    borderBottomWidth: 1,
    borderBottomColor: '#15233A',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121C2E',
    borderWidth: 1,
    borderColor: '#15233A',
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  topBarSpacer: {
    width: 42,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  heroCard: {
    backgroundColor: '#0B1220',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#15233A',
    padding: 20,
  },
  heroLeague: {
    color: '#E8EEF8',
    fontSize: 16,
    fontWeight: '900',
  },
  heroDate: {
    marginTop: 6,
    color: '#A9B6CC',
    fontSize: 13,
    lineHeight: 20,
  },
  scoreBoard: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  teamColumn: {
    flex: 1,
  },
  teamLabel: {
    color: '#7F8AA3',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  scoreBox: {
    minWidth: 116,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#121C2E',
    borderWidth: 1,
    borderColor: '#15233A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  liveScore: {
    color: '#FF4D4D',
  },
  scoreDivider: {
    marginHorizontal: 8,
    color: '#7F8AA3',
    fontSize: 14,
    fontWeight: '900',
  },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#121C2E',
    borderWidth: 1,
    borderColor: '#15233A',
  },
  statusPillLive: {
    backgroundColor: '#3A1212',
    borderColor: '#5B1A1A',
  },
  statusPillFinished: {
    backgroundColor: '#0E2E1A',
    borderColor: '#164A29',
  },
  statusText: {
    color: '#E8EEF8',
    fontSize: 12,
    fontWeight: '900',
  },
  statusTextLive: {
    color: '#FF4D4D',
  },
  statusTextFinished: {
    color: '#34D399',
  },
  card: {
    marginTop: 16,
    backgroundColor: '#0B1220',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#15233A',
    padding: 18,
  },
  sectionTitle: {
    color: '#E8EEF8',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#101827',
  },
  infoLabel: {
    color: '#7F8AA3',
    fontSize: 12,
    fontWeight: '800',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#050B16',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#121C2E',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
