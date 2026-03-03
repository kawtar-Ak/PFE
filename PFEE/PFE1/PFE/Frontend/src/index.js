import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";

import LoginScreen from "../Screens/LoginScreen";
import RegisterScreen from "../Screens/RegisterScreen";
import BottomTabNavigator from "../Screens/Home/BottomTabNavigator";
import MatchDetailsScreen from "../Screens/Home/MatchDetailsScreen";
import ProfileScreen from "../Screens/ProfileScreen";

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync().catch(() => {});

function LaunchAnimation({ onDone }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  }, [logoOpacity, logoScale, onDone, screenOpacity]);

  return (
    <Animated.View style={[styles.launchRoot, { opacity: screenOpacity }]}>
      <View style={styles.topShape} />
      <View style={styles.bottomShape} />
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
          alignItems: "center",
        }}
      >
        <Text style={styles.logoMark}>FOOT LIVE</Text>
        <Text style={styles.logoSub}>LIVE SCORE</Text>
      </Animated.View>
    </Animated.View>
  );
}

export default function App() {
  const [showLaunch, setShowLaunch] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.appRoot}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={BottomTabNavigator} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      {showLaunch ? <LaunchAnimation onDone={() => setShowLaunch(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: { flex: 1 },
  launchRoot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#001927",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  topShape: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "36%",
    backgroundColor: "#FF005C",
    borderBottomLeftRadius: 120,
  },
  bottomShape: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "70%",
    height: "30%",
    backgroundColor: "#FF005C",
    borderTopLeftRadius: 120,
  },
  logoMark: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 2,
  },
  logoSub: {
    color: "#B8C8D8",
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 3,
    fontWeight: "700",
  },
});
