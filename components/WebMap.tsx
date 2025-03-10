import React from 'react';
import { View, StyleSheet } from 'react-native';

const AMSTERDAM_COORDS = {
  lat: 52.3676,
  lon: 4.9041,
};

export const WebMap = () => {
  const bbox = {
    west: AMSTERDAM_COORDS.lon - 0.1,
    south: AMSTERDAM_COORDS.lat - 0.05,
    east: AMSTERDAM_COORDS.lon + 0.1,
    north: AMSTERDAM_COORDS.lat + 0.05,
  };

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.west}%2C${bbox.south}%2C${bbox.east}%2C${bbox.north}&amp;layer=mapnik&amp;marker=${AMSTERDAM_COORDS.lat}%2C${AMSTERDAM_COORDS.lon}`;

  return (
    <View style={styles.container}>
      <iframe
        src={osmUrl}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
        }}
        title="OpenStreetMap Amsterdam"
        allowFullScreen
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
}); 