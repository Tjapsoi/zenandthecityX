import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useRelaxation } from '../context/RelaxationContext';
import { Ionicons } from '@expo/vector-icons';

export default function RelaxationMomentsScreen() {
  const { relaxationMoments, isMonitoring, startMonitoring, stopMonitoring, provideFeedback } = useRelaxation();
  
  // Force a relaxation moment for testing when this screen loads
  useEffect(() => {
    const generateTestMoment = async () => {
      try {
        // If no moments exist and monitoring is active, wait a bit and then
        // the system will automatically generate a relaxation moment
        if (relaxationMoments.length === 0 && isMonitoring) {
          console.log('No relaxation moments yet, one will be generated shortly');
        }
      } catch (error) {
        console.error('Error generating test moment:', error);
      }
    };
    
    generateTestMoment();
  }, []);
  
  // Format a date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get the feedback status icon
  const getFeedbackIcon = (confirmed?: boolean) => {
    if (confirmed === true) return '✅';
    if (confirmed === false) return '❌';
    return '❓';
  };
  
  // Get the moment type icon
  const getMomentTypeIcon = (isManual?: boolean) => {
    if (isManual === true) return '👤'; // Manual icon
    return '🤖'; // Automatic detection icon
  };
  
  // Calculate statistics about relaxation moments
  const getStatistics = () => {
    if (relaxationMoments.length === 0) return null;
    
    const totalMoments = relaxationMoments.length;
    const confirmedMoments = relaxationMoments.filter(m => m.confirmed === true).length;
    const rejectedMoments = relaxationMoments.filter(m => m.confirmed === false).length;
    const pendingMoments = relaxationMoments.filter(m => m.confirmed === undefined).length;
    const manualMoments = relaxationMoments.filter(m => m.isManual === true).length;
    const detectedMoments = relaxationMoments.filter(m => m.isManual !== true).length;
    
    const accuracy = totalMoments > 0 
      ? Math.round((confirmedMoments / (confirmedMoments + rejectedMoments || 1)) * 100) 
      : 0;
    
    return {
      totalMoments,
      confirmedMoments,
      rejectedMoments,
      pendingMoments,
      manualMoments,
      detectedMoments,
      accuracy: isNaN(accuracy) ? 0 : accuracy,
    };
  };
  
  const stats = getStatistics();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#444" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Zen Moments</Text>
      </View>
      
      <View style={styles.monitoringContainer}>
        <Text style={styles.monitoringText}>
          Relaxation Monitoring: {isMonitoring ? 'Active' : 'Inactive'}
        </Text>
        <TouchableOpacity
          style={[styles.monitoringButton, { backgroundColor: isMonitoring ? '#e74c3c' : '#5A9E6F' }]}
          onPress={isMonitoring ? stopMonitoring : startMonitoring}
        >
          <Text style={styles.monitoringButtonText}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalMoments}</Text>
              <Text style={styles.statLabel}>Total Moments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.confirmedMoments}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.manualMoments}</Text>
              <Text style={styles.statLabel}>Manual</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.detectedMoments}</Text>
              <Text style={styles.statLabel}>Auto-detected</Text>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.momentsContainer}>
        <Text style={styles.momentsTitle}>Zen Moments</Text>
        {relaxationMoments.length === 0 ? (
          <Text style={styles.emptyText}>No zen moments recorded yet. We'll notify you when we detect one!</Text>
        ) : (
          <FlatList
            data={[...relaxationMoments].sort((a, b) => b.timestamp - a.timestamp)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.momentItem}>
                <View style={styles.momentHeader}>
                  <Text style={styles.momentType}>
                    {getMomentTypeIcon(item.isManual)} {item.isManual ? 'Manual' : 'Detected'}
                  </Text>
                  <Text style={styles.momentFeedback}>{getFeedbackIcon(item.confirmed)}</Text>
                </View>
                <Text style={styles.momentTime}>
                  <Ionicons name="time-outline" size={14} /> {formatDate(item.timestamp)}
                </Text>
                <Text style={styles.momentDetails}>
                  <Ionicons name="heart-outline" size={14} /> Heart rate: {item.heartRate} bpm
                </Text>
                <Text style={styles.momentDetails}>
                  <Ionicons name="pulse-outline" size={14} /> Stress level: {item.stressLevel}/100
                </Text>
                {item.nearbyPlace && (
                  <Text style={styles.momentNearby}>
                    <Ionicons name="location-outline" size={14} /> Near: {item.nearbyPlace.name}
                  </Text>
                )}
                {item.confirmed === undefined && (
                  <View style={styles.feedbackButtons}>
                    <TouchableOpacity 
                      style={[styles.feedbackButton, styles.yesFeedback]} 
                      onPress={() => provideFeedback(item.id, true)}
                    >
                      <Text style={styles.feedbackButtonText}>Yes, I was relaxed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.feedbackButton, styles.noFeedback]} 
                      onPress={() => provideFeedback(item.id, false)}
                    >
                      <Text style={styles.feedbackButtonText}>No, I wasn't</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  monitoringContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  monitoringText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    flex: 1,
  },
  monitoringButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  monitoringButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5A9E6F',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  momentsContainer: {
    flex: 1,
    padding: 20,
  },
  momentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  momentItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  momentType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  momentFeedback: {
    fontSize: 18,
  },
  momentTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  momentDetails: {
    fontSize: 14,
    color: '#666',
  },
  momentNearby: {
    fontSize: 14,
    color: '#666',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  feedbackButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  yesFeedback: {
    backgroundColor: '#5A9E6F',
  },
  noFeedback: {
    backgroundColor: '#e74c3c',
  },
  feedbackButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 