import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Redirect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkQuestionnaire = async () => {
      try {
        const completed = await AsyncStorage.getItem('completedQuestionnaire');
        console.log('AsyncStorage completedQuestionnaire value:', completed);
        setHasCompletedQuestionnaire(completed === 'true');
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking questionnaire status:', error);
        setIsLoading(false);
      }
    };
    
    checkQuestionnaire();
  }, []);
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={() => router.push('/debug')}
      >
        <Text style={styles.debugButtonText}>Debug</Text>
      </TouchableOpacity>
      
      {hasCompletedQuestionnaire === false ? (
        <Redirect href="/questionnaire" />
      ) : (
        <Redirect href="/(tabs)" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    fontSize: 18,
    color: '#1e293b',
    fontFamily: 'Inter-Regular',
  },
  debugButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 100,
  },
  debugButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
}); 