import React, { useEffect, useState } from 'react';
import { Platform, View, StyleSheet, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Heart } from 'lucide-react-native';
import { zenPlaces, ZenPlace } from '../data/zenPlaces';
import { useFavorites } from '../context/FavoritesContext';
import { usePreferences } from '../context/PreferencesContext';
import { getRecommendedPlaces } from '../services/OpenStreetMapService';
import MapView, { Marker } from 'react-native-maps';

// Web Map Implementation with Recommendations
const WebMap = () => {
  const { preferences } = usePreferences();
  const [recommendations, setRecommendations] = useState<ZenPlace[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const places = await getRecommendedPlaces(preferences, zenPlaces);
        setRecommendations(places.length > 0 ? places : zenPlaces);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setRecommendations(zenPlaces);
      }
      setLoading(false);
    };
    
    loadRecommendations();
  }, [preferences]);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Finding zen places...</Text>
      </View>
    );
  }
  
  const centerLat = recommendations.reduce((sum, place) => sum + place.coordinates.latitude, 0) / recommendations.length;
  const centerLon = recommendations.reduce((sum, place) => sum + place.coordinates.longitude, 0) / recommendations.length;
  
  // Calculate bounds (simple approach)
  const padding = 0.02; // About 2km
  const bbox = {
    west: centerLon - padding,
    south: centerLat - padding,
    east: centerLon + padding,
    north: centerLat + padding,
  };

  const markers = recommendations.map(place => (
    `&marker=${place.coordinates.latitude},${place.coordinates.longitude}`
  )).join('');

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.west},${bbox.south},${bbox.east},${bbox.north}&layer=mapnik${markers}`;

  return (
    <View style={styles.container}>
      <iframe
        src={osmUrl}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
        }}
        title="OpenStreetMap Zen Places"
        allowFullScreen
      />
    </View>
  );
};

// Native Map Implementation with Recommendations
const NativeMap = () => {
  const { preferences } = usePreferences();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [recommendations, setRecommendations] = useState<ZenPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<ZenPlace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const places = await getRecommendedPlaces(preferences, zenPlaces);
        setRecommendations(places.length > 0 ? places : zenPlaces);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setRecommendations(zenPlaces);
      }
      setLoading(false);
    };
    
    loadRecommendations();
  }, [preferences]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Finding zen places...</Text>
      </View>
    );
  }
  
  // Calculate center of recommendations
  const centerLat = recommendations.reduce((sum, place) => sum + place.coordinates.latitude, 0) / recommendations.length;
  const centerLon = recommendations.reduce((sum, place) => sum + place.coordinates.longitude, 0) / recommendations.length;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {recommendations.map(place => (
          <Marker
            key={place.id}
            coordinate={place.coordinates}
            onPress={() => setSelectedPlace(place)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(place.type) }]}>
              <View style={styles.marker} />
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedPlace && (
        <View style={styles.placeCard}>
          <Image
            source={{ uri: selectedPlace.imageUrl }}
            style={styles.placeImage}
          />
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{selectedPlace.name}</Text>
            <Text style={styles.placeType}>{selectedPlace.type}</Text>
            <Text style={styles.placeDescription}>{selectedPlace.description}</Text>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => {
                isFavorite(selectedPlace.id)
                  ? removeFavorite(selectedPlace.id)
                  : addFavorite(selectedPlace);
              }}
            >
              <Heart
                size={24}
                color={isFavorite(selectedPlace.id) ? '#ef4444' : '#94a3b8'}
                fill={isFavorite(selectedPlace.id) ? '#ef4444' : 'none'}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedPlace(null)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

function getMarkerColor(type: string): string {
  switch (type) {
    case 'park':
      return '#22c55e';
    case 'meditation':
      return '#8b5cf6';
    case 'cafe':
      return '#f59e0b';
    case 'garden':
      return '#10b981';
    default:
      return '#6b7280';
  }
}

export const RecommendationMap = Platform.OS === 'web' ? WebMap : NativeMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'Inter-Regular',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  placeCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
    fontFamily: 'Inter-SemiBold',
  },
  placeType: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  placeDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  favoriteButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
}); 