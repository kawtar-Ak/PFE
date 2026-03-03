import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

export default function LeaguesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Leagues</Text>
        <Text style={styles.subtitle}>Liste des compétitions à venir...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#E0F2FE', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#94a3b8', marginTop: 8 }
});