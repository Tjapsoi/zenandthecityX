import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import { useFavorites } from '../../context/FavoritesContext';

export default function FavoritesScreen() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Your Zen Places</Text>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            You haven't saved any zen places yet.{'\n'}
            Explore the map to find peaceful spots!
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {favorites.map(place => (
            <View key={place.id} style={styles.placeCard}>
              <Image
                source={{ uri: place.imageUrl }}
                style={styles.placeImage}
              />
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeDescription}>{place.description}</Text>
                <View style={styles.placeType}>
                  <Text style={styles.placeTypeText}>{place.type}</Text>
                </View>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => removeFavorite(place.id)}
                >
                  <Heart size={24} color="#ef4444" fill="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    padding: 20,
    fontFamily: 'Inter-Bold',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  placeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeInfo: {
    padding: 16,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  placeDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  placeType: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  placeTypeText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
    fontFamily: 'Inter-Regular',
  },
  favoriteButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
});