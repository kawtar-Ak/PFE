import React, { useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api/user';

export default function RegisterScreen({ navigation, route }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = route?.params?.redirectTo || 'Home';
  const message = route?.params?.message || '';

  const subtitle = useMemo(() => {
    if (message) return message;
    return 'Creez un compte pour sauvegarder vos favoris et acceder a votre profil.';
  }, [message]);

  const handleRedirectAfterRegister = () => {
    if (redirectTo === 'Favoris') {
      navigation.replace('Home', { screen: 'Favoris' });
      return;
    }

    if (redirectTo === 'Profile') {
      navigation.replace('Profile');
      return;
    }

    navigation.replace('Home', { screen: 'Home' });
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erreur', data.message || data.error || 'Inscription impossible.');
        return;
      }

      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      handleRedirectAfterRegister();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../img/result_0.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.shell}>
            <View style={styles.hero}>
              <Text style={styles.kicker}>Nouveau compte</Text>
              <Text style={styles.heroTitle}>Un compte seulement si vous en avez besoin.</Text>
              <Text style={styles.heroText}>
                L'application reste accessible sans connexion. Creez un compte pour retrouver vos favoris et vos
                informations sur tous vos appareils.
              </Text>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.9}
                onPress={() => navigation.replace('Home', { screen: 'Home' })}
              >
                <Text style={styles.secondaryButtonText}>Continuer sans compte</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Inscription</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>

              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor="#7F8AA3"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#7F8AA3"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#7F8AA3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#7F8AA3"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Creer mon compte</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkRow}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Login', { redirectTo, message })}
              >
                <Text style={styles.linkText}>J'ai deja un compte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#050B16',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 11, 22, 0.72)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  shell: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 20,
  },
  hero: {
    flex: 1,
    minHeight: 260,
    backgroundColor: 'rgba(11, 18, 32, 0.82)',
    borderWidth: 1,
    borderColor: '#15233A',
    borderRadius: 28,
    padding: 28,
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#7DB5FF',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    marginTop: 14,
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
  },
  heroText: {
    marginTop: 12,
    color: '#A9B6CC',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 460,
  },
  secondaryButton: {
    marginTop: 24,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#223552',
    backgroundColor: '#0F1A2D',
  },
  secondaryButtonText: {
    color: '#E8EEF8',
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 420 : '100%',
    backgroundColor: 'rgba(11, 18, 32, 0.94)',
    borderWidth: 1,
    borderColor: '#15233A',
    borderRadius: 28,
    padding: 24,
    alignSelf: 'center',
    width: '100%',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  cardSubtitle: {
    color: '#A9B6CC',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 22,
  },
  input: {
    backgroundColor: '#121C2E',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#15233A',
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#FF4D4D',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  linkRow: {
    marginTop: 18,
    alignSelf: 'center',
  },
  linkText: {
    color: '#7DB5FF',
    fontSize: 14,
    fontWeight: '800',
  },
});
