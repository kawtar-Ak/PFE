import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './HomeScreen';
import LiveScreen from './LiveScreen';
import FavoritesScreen from './FavoritesScreen';
import NewsScreen from './NewsScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const protectFavorites = async (e, navigation) => {
    const token = await AsyncStorage.getItem('userToken');

    if (token) {
      return;
    }

    e.preventDefault();
    navigation.getParent()?.navigate('Login', {
      redirectTo: 'Favoris',
      message: 'Connectez-vous pour acceder aux favoris',
    });
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#07111F',
          borderTopWidth: 1,
          borderTopColor: '#15233A',
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#FF4D4D',
        tabBarInactiveTintColor: '#7F8AA3',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
        sceneStyle: {
          backgroundColor: '#050B16',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse-outline';

          if (route.name === 'Home') iconName = 'grid-outline';
          if (route.name === 'Live') iconName = 'radio-outline';
          if (route.name === 'Favoris') iconName = 'star-outline';
          if (route.name === 'News') iconName = 'newspaper-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Matchs',
          tabBarTestID: 'tab-home',
        }}
      />
      <Tab.Screen
        name="Live"
        component={LiveScreen}
        options={{
          title: 'Live',
          tabBarTestID: 'tab-live',
        }}
      />
      <Tab.Screen
        name="Favoris"
        component={FavoritesScreen}
        options={{
          title: 'Favoris',
          tabBarTestID: 'tab-favoris',
        }}
        listeners={({ navigation }) => ({
          tabPress: async (e) => {
            await protectFavorites(e, navigation);
          },
        })}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          title: 'News',
          tabBarTestID: 'tab-news',
        }}
      />
    </Tab.Navigator>
  );
}
