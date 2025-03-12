import React, { createContext, useContext, useEffect, useState } from 'react';
import { wearableDataService, RelaxationMoment, WearableData } from '../services/WearableDataService';
import { notificationService } from '../services/NotificationService';
import { usePreferences } from './PreferencesContext';
import { Platform } from 'react-native';

interface RelaxationContextValue {
  isMonitoring: boolean;
  currentWearableData: WearableData | null;
  relaxationMoments: RelaxationMoment[];
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  provideFeedback: (momentId: string, wasRelaxing: boolean) => Promise<void>;
  addManualRelaxationMoment: () => Promise<void>;
}

// Create the context with default values
const RelaxationContext = createContext<RelaxationContextValue>({
  isMonitoring: false,
  currentWearableData: null,
  relaxationMoments: [],
  startMonitoring: async () => {},
  stopMonitoring: () => {},
  provideFeedback: async () => {},
  addManualRelaxationMoment: async () => {},
});

// Provider component
export const RelaxationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentWearableData, setCurrentWearableData] = useState<WearableData | null>(null);
  const [relaxationMoments, setRelaxationMoments] = useState<RelaxationMoment[]>([]);
  const { preferences } = usePreferences();

  // Initialize notification service
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.initialize();
        console.log('Notification service initialized successfully');
      } catch (error) {
        console.error('Error initializing notification service:', error);
      }
    };
    
    initNotifications();
    
    // Cleanup on unmount
    return () => {
      try {
        notificationService.cleanup();
        wearableDataService.stopMonitoring();
      } catch (error) {
        console.error('Error cleaning up services:', error);
      }
    };
  }, []);

  // Set up listeners for wearable data and relaxation moments
  useEffect(() => {
    if (isMonitoring) {
      try {
        // Listen for wearable data updates
        const dataUnsubscribe = wearableDataService.addDataListener((data) => {
          setCurrentWearableData(data);
        });
        
        // Listen for relaxation moments
        const relaxationUnsubscribe = wearableDataService.addRelaxationListener(async (moment) => {
          console.log('Relaxation moment detected:', moment);
          
          // Update local state
          setRelaxationMoments((prev) => [...prev, moment]);
          
          // Send notification
          try {
            await notificationService.sendRelaxationNotification(moment);
          } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
          }
        });
        
        return () => {
          dataUnsubscribe();
          relaxationUnsubscribe();
        };
      } catch (error) {
        console.error('Error setting up data listeners:', error);
      }
    }
  }, [isMonitoring]);

  // Start monitoring for relaxation moments
  const startMonitoring = async () => {
    if (!isMonitoring) {
      try {
        await wearableDataService.startMonitoring();
        setIsMonitoring(true);
        console.log('Relaxation monitoring started');
      } catch (error) {
        console.error('Error starting monitoring:', error);
      }
    }
  };

  // Stop monitoring for relaxation moments
  const stopMonitoring = () => {
    if (isMonitoring) {
      try {
        wearableDataService.stopMonitoring();
        setIsMonitoring(false);
        console.log('Relaxation monitoring stopped');
      } catch (error) {
        console.error('Error stopping monitoring:', error);
      }
    }
  };

  // Provide feedback for a relaxation moment
  const provideFeedback = async (momentId: string, wasRelaxing: boolean) => {
    try {
      // Update local state first
      setRelaxationMoments((prev) =>
        prev.map((moment) =>
          moment.id === momentId ? { ...moment, confirmed: wasRelaxing } : moment
        )
      );

      // Store feedback in the wearable service
      wearableDataService.addFeedback(momentId, wasRelaxing);
      
      // Store feedback in notification service
      await notificationService.storeFeedback(momentId, wasRelaxing);
      
      console.log(`Feedback provided for moment ${momentId}: ${wasRelaxing ? 'Relaxing' : 'Not relaxing'}`);
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  };

  // Add a manual relaxation moment
  const addManualRelaxationMoment = async (): Promise<void> => {
    try {
      console.log('Manually adding a relaxation moment');
      
      // Create a manual relaxation moment
      const mockData = wearableDataService.generateMockRelaxationData();
      
      // Add to the wearable service
      const moment = wearableDataService.addManualRelaxationMoment(mockData);
      
      // Update local state
      setRelaxationMoments((prev) => [...prev, moment]);
      
      // Send notification
      try {
        await notificationService.sendRelaxationNotification(moment);
        console.log('Manual relaxation notification sent');
      } catch (notificationError) {
        console.error('Error sending manual relaxation notification:', notificationError);
      }
      
      console.log('Manual relaxation moment added successfully');
    } catch (error) {
      console.error('Error adding manual relaxation moment:', error);
    }
  };

  return (
    <RelaxationContext.Provider
      value={{
        isMonitoring,
        currentWearableData,
        relaxationMoments,
        startMonitoring,
        stopMonitoring,
        provideFeedback,
        addManualRelaxationMoment,
      }}
    >
      {children}
    </RelaxationContext.Provider>
  );
};

// Custom hook for using the relaxation context
export const useRelaxation = () => useContext(RelaxationContext); 