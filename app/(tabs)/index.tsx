import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Map } from '../../components/Map';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mapContainer}>
        <Map />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
});