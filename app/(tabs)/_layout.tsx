import React from 'react';
import { Tabs } from 'expo-router';
import { MapPin, Heart, User } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#475569',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Your Map',
          tabBarIcon: ({ color, size }) => (
            <MapPin size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Zen Places',
          tabBarIcon: ({ color, size }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#E1F5E9',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});