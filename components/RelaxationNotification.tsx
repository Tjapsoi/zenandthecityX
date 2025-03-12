import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRelaxation } from '../context/RelaxationContext';

// In-app notification for relaxation moments
const RelaxationNotification: React.FC = () => {
  const { relaxationMoments, provideFeedback } = useRelaxation();
  const [visibleMoment, setVisibleMoment] = useState<string | null>(null);
  const [notificationText, setNotificationText] = useState('');
  const [placeName, setPlaceName] = useState('');
  const animatedValue = useState(new Animated.Value(0))[0];
  
  // Watch for new relaxation moments
  useEffect(() => {
    // Get the most recent unconfirmed moment
    const latestMoment = [...relaxationMoments]
      .filter(m => m.confirmed === undefined)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (latestMoment && latestMoment.id !== visibleMoment) {
      // Format the time
      const time = new Date(latestMoment.timestamp);
      const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Set the notification text
      if (latestMoment.nearbyPlace) {
        setNotificationText(`You seemed particularly relaxed at ${timeString} near ${latestMoment.nearbyPlace.name}.`);
        setPlaceName(latestMoment.nearbyPlace.name);
      } else {
        setNotificationText(`You seemed particularly relaxed at ${timeString}.`);
        setPlaceName('');
      }
      
      // Show the notification
      setVisibleMoment(latestMoment.id);
      showNotification();
    }
  }, [relaxationMoments]);
  
  // Function to handle "Yes" tap
  const handleYes = async () => {
    if (visibleMoment) {
      await provideFeedback(visibleMoment, true);
      hideNotification();
    }
  };
  
  // Function to handle "No" tap
  const handleNo = async () => {
    if (visibleMoment) {
      await provideFeedback(visibleMoment, false);
      hideNotification();
    }
  };
  
  // Animate the notification in
  const showNotification = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  };
  
  // Animate the notification out
  const hideNotification = () => {
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: true,
      speed: 20,
    }).start(() => {
      setVisibleMoment(null);
    });
  };
  
  // Transform styles for animation
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });
  
  // Only render if there's a visible moment
  if (!visibleMoment) return null;
  
  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Zen Moment Detected</Text>
            <Text style={styles.message}>{notificationText}</Text>
            <Text style={styles.question}>Was this a good moment for you?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleYes}>
                <Text style={styles.buttonText}>Yes ✅</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleNo}>
                <Text style={styles.buttonText}>No ❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      ) : (
        <View style={[styles.contentContainer, styles.androidShadow]}>
          <Text style={styles.title}>Zen Moment Detected</Text>
          <Text style={styles.message}>{notificationText}</Text>
          <Text style={styles.question}>Was this a good moment for you?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleYes}>
              <Text style={styles.buttonText}>Yes ✅</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleNo}>
              <Text style={styles.buttonText}>No ❌</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  blurContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.3)' : 'white',
    borderRadius: 12,
  },
  androidShadow: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  message: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#5A9E6F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    margin: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RelaxationNotification; 