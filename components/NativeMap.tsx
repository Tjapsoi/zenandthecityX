import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const AMSTERDAM_REGION = {
  latitude: 52.3676,
  longitude: 4.9041,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const NativeMap = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={AMSTERDAM_REGION}
        minZoomLevel={10}
        maxZoomLevel={18}
      >
        <Marker
          coordinate={{
            latitude: AMSTERDAM_REGION.latitude,
            longitude: AMSTERDAM_REGION.longitude,
          }}
          title="Amsterdam"
          description="Capital of the Netherlands"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
}); 