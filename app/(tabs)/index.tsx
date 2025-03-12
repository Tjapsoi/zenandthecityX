import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { RecommendationMap } from '../../components/RecommendationMap';
import { usePreferences } from '../../context/PreferencesContext';
import { useRelaxation } from '../../context/RelaxationContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function MapScreen() {
  const { preferences } = usePreferences();
  const { isMonitoring, startMonitoring, relaxationMoments, addManualRelaxationMoment } = useRelaxation();
  
  // Start monitoring automatically when the screen loads
  useEffect(() => {
    // Auto-start monitoring if the questionnaire is completed
    if (!isMonitoring) {
      startMonitoring();
    }
  }, []);
  
  const onDebugPress = () => {
    router.push('/debug');
  };
  
  const onRelaxationPress = () => {
    // Using type assertion to bypass type issues
    router.push('/relaxation-moments' as any);
  };
  
  // Calculate the number of relaxation moments today
  const getTodayMomentsCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return relaxationMoments.filter(
      moment => moment.timestamp >= today.getTime()
    ).length;
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Zen Places for You</Text>
        <Text style={styles.subtitle}>
          Personalized recommendations based on your preferences
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.recommendButton]} 
            onPress={() => router.push('/recommendations')}
          >
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.buttonGradient}
            >
              <Ionicons name="compass" size={24} color="white" />
              <Text style={styles.buttonText}>Get Recommendations</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.zenMomentsButton]} 
            onPress={() => router.push('/relaxation-moments' as any)}
          >
            <LinearGradient
              colors={['#56ab2f', '#a8e063']}
              style={styles.buttonGradient}
            >
              <Ionicons name="leaf" size={24} color="white" />
              <Text style={styles.buttonText}>Zen Moments ({getTodayMomentsCount()})</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.imZenButton]} 
            onPress={() => {
              addManualRelaxationMoment();
            }}
          >
            <LinearGradient
              colors={['#FF8E53', '#FE6B8B']}
              style={styles.buttonGradient}
            >
              <Ionicons name="heart" size={24} color="white" />
              <Text style={styles.buttonText}>I'm Feeling Zen Now</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.preferencesButton]} 
            onPress={() => router.push('/preferences')}
          >
            <LinearGradient
              colors={['#4A00E0', '#8E2DE2']}
              style={styles.buttonGradient}
            >
              <Ionicons name="options" size={24} color="white" />
              <Text style={styles.buttonText}>Update Preferences</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={onDebugPress}
          >
            <Text style={styles.debugButtonText}>Debug</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.mapContainer}>
        <RecommendationMap />
      </View>
      {isMonitoring && (
        <View style={styles.monitoringIndicator}>
          <Ionicons name="pulse" size={16} color="#5A9E6F" />
          <Text style={styles.monitoringText}>Relaxation monitoring active</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  mapContainer: {
    flex: 1,
  },
  debugButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  debugButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  recommendationButton: {
    backgroundColor: '#5A9E6F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recommendationButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  monitoringIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  monitoringText: {
    color: '#5A9E6F',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  recommendButton: {
    marginVertical: 8,
  },
  zenMomentsButton: {
    marginVertical: 8,
  },
  imZenButton: {
    marginVertical: 8,
  },
  preferencesButton: {
    marginVertical: 8,
  },
});