import React from 'react';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { FavoritesProvider } from '../context/FavoritesContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { RelaxationProvider } from '../context/RelaxationContext';
import RelaxationNotification from '../components/RelaxationNotification';

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PreferencesProvider>
      <FavoritesProvider>
        <RelaxationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="connect-device" options={{ headerShown: false }} />
            <Stack.Screen name="debug" options={{ headerShown: false }} />
            <Stack.Screen name="questionnaire" options={{ headerShown: false }} />
            <Stack.Screen name="relaxation-moments" options={{ headerShown: false }} />
          </Stack>
          <RelaxationNotification />
          <StatusBar style="auto" />
        </RelaxationProvider>
      </FavoritesProvider>
    </PreferencesProvider>
  );
}