import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DebugScreen() {
  const [completedQuestionnaire, setCompletedQuestionnaire] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<string | null>(null);
  const [storageItems, setStorageItems] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Load all AsyncStorage items
    const loadStorageItems = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const items: Record<string, string> = {};
        
        for (const key of keys) {
          const value = await AsyncStorage.getItem(key);
          items[key] = value || 'null';
        }
        
        setStorageItems(items);
        
        // Get specific items
        const completed = await AsyncStorage.getItem('completedQuestionnaire');
        setCompletedQuestionnaire(completed);
        
        const prefs = await AsyncStorage.getItem('userPreferences');
        setUserPreferences(prefs);
      } catch (error) {
        console.error('Error loading storage items:', error);
      }
    };
    
    loadStorageItems();
  }, []);
  
  const resetQuestionnaire = async () => {
    try {
      await AsyncStorage.removeItem('completedQuestionnaire');
      await AsyncStorage.removeItem('userPreferences');
      setCompletedQuestionnaire(null);
      setUserPreferences(null);
      alert('Questionnaire status reset. Redirecting to main screen...');
      setTimeout(() => {
        router.replace('/');
      }, 1000);
    } catch (error) {
      console.error('Error resetting questionnaire:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Debug Information</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questionnaire Status</Text>
          <Text style={styles.infoText}>
            Has completed questionnaire: {completedQuestionnaire === 'true' ? 'Yes' : 'No'}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Preferences</Text>
          <Text style={styles.infoText}>
            {userPreferences ? userPreferences : 'No preferences stored'}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AsyncStorage Items</Text>
          {Object.entries(storageItems).map(([key, value]) => (
            <Text key={key} style={styles.infoText}>
              {key}: {value}
            </Text>
          ))}
        </View>
        
        <TouchableOpacity style={styles.button} onPress={resetQuestionnaire}>
          <Text style={styles.buttonText}>Reset Questionnaire</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.secondaryButtonText}>Go to Main App</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#1e293b',
    fontFamily: 'Inter-Bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
    fontFamily: 'Inter-SemiBold',
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
  },
  secondaryButtonText: {
    color: '#64748b',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
}); 