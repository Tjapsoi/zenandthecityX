import { ZenPlace } from '../data/zenPlaces';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

// Define data types for wearable data
export interface WearableData {
  heartRate: number;        // beats per minute
  stressLevel: number;      // 0 (relaxed) to 100 (stressed)
  movement: number;         // 0 (still) to 100 (very active)
  timestamp: number;        // milliseconds
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Interface for relaxation moment
export interface RelaxationMoment {
  id: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  heartRate: number;
  stressLevel: number;
  nearbyPlace?: ZenPlace;
  confirmed?: boolean;      // User feedback (true = was relaxing, false = was not relaxing)
  isManual?: boolean;       // Mark if manually created
}

// Class to simulate and process wearable data
export class WearableDataService {
  private data: WearableData[] = [];
  private relaxationMoments: RelaxationMoment[] = [];
  private listeners: ((data: WearableData) => void)[] = [];
  private relaxationListeners: ((moment: RelaxationMoment) => void)[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private locationSubscription: any = null;
  private lastLocation: Location.LocationObject | null = null;
  private shouldGenerateMockRelaxation = false;
  private relaxationTestTimeout: NodeJS.Timeout | null = null;

  // Singleton pattern
  private static instance: WearableDataService;
  
  public static getInstance(): WearableDataService {
    if (!WearableDataService.instance) {
      WearableDataService.instance = new WearableDataService();
    }
    return WearableDataService.instance;
  }

  private constructor() {
    // Start with some initial data
    this.generateInitialData();
    console.log('WearableDataService initialized');
  }

  // Add a data listener
  public addDataListener(listener: (data: WearableData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Add a relaxation moment listener
  public addRelaxationListener(listener: (moment: RelaxationMoment) => void): () => void {
    this.relaxationListeners.push(listener);
    return () => {
      this.relaxationListeners = this.relaxationListeners.filter((l) => l !== listener);
    };
  }

  // Start monitoring wearable data
  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting wearable data monitoring');
    
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // Start tracking location
        this.locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10, // minimum distance (meters) between updates
            timeInterval: 5000,  // minimum time (ms) between updates
          },
          (location) => {
            this.lastLocation = location;
          }
        );
        console.log('Location tracking started');
      } else {
        console.log('Location permission denied, using mock locations');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }

    // Start generating simulated data
    this.monitoringInterval = setInterval(() => {
      const newData = this.generateSampledData();
      this.data.push(newData);
      
      // Keep only recent data (last hour)
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      this.data = this.data.filter((d) => d.timestamp >= oneHourAgo);
      
      // Notify listeners
      this.listeners.forEach((listener) => listener(newData));
      
      // Check for relaxation moment
      if (this.isRelaxationMoment(newData)) {
        this.addRelaxationMoment(newData);
      }
    }, 30000); // Generate data every 30 seconds (changed from 5000ms)
    
    // Schedule a mock relaxation moment for testing
    if (this.relaxationMoments.length === 0) {
      this.shouldGenerateMockRelaxation = true;
      this.relaxationTestTimeout = setTimeout(() => {
        if (this.shouldGenerateMockRelaxation) {
          console.log('Generating test relaxation moment');
          const mockData = this.generateMockRelaxationData();
          this.data.push(mockData);
          this.addRelaxationMoment(mockData);
          this.shouldGenerateMockRelaxation = false;
        }
      }, 30000); // Generate a relaxation moment after 30 seconds (changed from 10000ms)
    }
  }

  // Stop monitoring
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    console.log('Stopping wearable data monitoring');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.relaxationTestTimeout) {
      clearTimeout(this.relaxationTestTimeout);
      this.relaxationTestTimeout = null;
    }
    
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    
    this.shouldGenerateMockRelaxation = false;
  }

  // Add user feedback to a relaxation moment
  public addFeedback(momentId: string, wasRelaxing: boolean): void {
    const moment = this.relaxationMoments.find((m) => m.id === momentId);
    if (moment) {
      moment.confirmed = wasRelaxing;
      // In a real app, you would update a backend database here
      console.log(`User feedback for moment ${momentId}: ${wasRelaxing ? 'Relaxing' : 'Not relaxing'}`);
    } else {
      console.log(`No relaxation moment found with id ${momentId}`);
    }
  }

  // Get all relaxation moments
  public getRelaxationMoments(): RelaxationMoment[] {
    return [...this.relaxationMoments];
  }

  // Get recent wearable data
  public getRecentData(minutes: number = 10): WearableData[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.data.filter((d) => d.timestamp >= cutoff);
  }

  // Generate a mock relaxation data point for testing (make public)
  public generateMockRelaxationData(): WearableData {
    // Create a very relaxed data point
    const data: WearableData = {
      heartRate: 60, // Low heart rate
      stressLevel: 10, // Very low stress
      movement: 5,   // Very little movement
      timestamp: Date.now(),
    };
    
    // Add location
    data.location = {
      latitude: 52.3676 + (Math.random() - 0.5) * 0.01,
      longitude: 4.9041 + (Math.random() - 0.5) * 0.01,
    };
    
    console.log('Generated mock relaxation data:', data);
    return data;
  }

  // Create a manual relaxation moment from user input
  public addManualRelaxationMoment(data: WearableData): RelaxationMoment {
    if (!data.location) {
      // Add a default location if none exists
      data.location = {
        latitude: 52.3676 + (Math.random() - 0.5) * 0.01,
        longitude: 4.9041 + (Math.random() - 0.5) * 0.01,
      };
    }
    
    const moment: RelaxationMoment = {
      id: `manual-relaxation-${Date.now()}`,
      timestamp: data.timestamp,
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      },
      heartRate: data.heartRate,
      stressLevel: data.stressLevel,
      isManual: true, // Mark as manually created
    };
    
    this.relaxationMoments.push(moment);
    console.log('Manual relaxation moment created:', moment);
    
    // Keep only recent moments (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.relaxationMoments = this.relaxationMoments.filter((m) => m.timestamp >= oneDayAgo);
    
    // Notify listeners
    this.relaxationListeners.forEach((listener) => listener(moment));
    
    return moment;
  }

  // Generate some initial historical data
  private generateInitialData(): void {
    const now = Date.now();
    
    // Generate data for the last hour
    for (let i = 0; i < 60; i++) {
      this.data.push({
        heartRate: Math.floor(Math.random() * 20) + 60, // 60-80 bpm
        stressLevel: Math.floor(Math.random() * 50) + 30, // 30-80 stress
        movement: Math.floor(Math.random() * 30), // 0-30 movement
        timestamp: now - (60 - i) * 60 * 1000, // Last hour, one per minute
      });
    }
  }

  // Generate simulated wearable data with occasional relaxation moments
  private generateSampledData(): WearableData {
    // Get the previous data point for continuity
    const prevData = this.data.length > 0 ? this.data[this.data.length - 1] : null;
    
    // Base values
    let heartRate = prevData ? prevData.heartRate : 70;
    let stressLevel = prevData ? prevData.stressLevel : 50;
    let movement = prevData ? prevData.movement : 20;
    
    // Add some randomness, but keep the changes small
    heartRate += (Math.random() - 0.5) * 6;
    stressLevel += (Math.random() - 0.5) * 10;
    movement += (Math.random() - 0.5) * 15;
    
    // Enforce realistic ranges
    heartRate = Math.max(50, Math.min(120, heartRate));
    stressLevel = Math.max(0, Math.min(100, stressLevel));
    movement = Math.max(0, Math.min(100, movement));
    
    // Every so often, simulate a relaxation moment (reduce from 15% to 5% since checking less frequently)
    if (Math.random() < 0.05) {
      heartRate = Math.max(55, heartRate - 15);  // Significant drop in heart rate
      stressLevel = Math.max(5, stressLevel - 30); // Significant drop in stress
      movement = Math.max(0, movement - 15);    // Less movement
    }
    
    // Create the data point
    const data: WearableData = {
      heartRate: Math.floor(heartRate),
      stressLevel: Math.floor(stressLevel),
      movement: Math.floor(movement),
      timestamp: Date.now(),
    };
    
    // Add location if available
    if (this.lastLocation) {
      data.location = {
        latitude: this.lastLocation.coords.latitude,
        longitude: this.lastLocation.coords.longitude,
      };
    } else {
      // Fake Amsterdam location if no real location
      data.location = {
        latitude: 52.3676 + (Math.random() - 0.5) * 0.01,
        longitude: 4.9041 + (Math.random() - 0.5) * 0.01,
      };
    }
    
    return data;
  }

  // Determine if a given data point indicates a relaxation moment
  private isRelaxationMoment(data: WearableData): boolean {
    // For testing purposes, make the detection more lenient
    if (!data.location) return false;
    
    // Check for a significant drop in heart rate or stress level
    // and low movement
    
    // Get the previous 3 data points for comparison
    const recentData = this.getRecentData(5);
    if (recentData.length < 4) return false; // Need at least 3 previous points + current
    
    // Calculate averages of previous points (excluding current)
    const previousData = recentData.slice(0, recentData.length - 1);
    const avgHeartRate = previousData.reduce((sum, d) => sum + d.heartRate, 0) / previousData.length;
    const avgStressLevel = previousData.reduce((sum, d) => sum + d.stressLevel, 0) / previousData.length;
    const avgMovement = previousData.reduce((sum, d) => sum + d.movement, 0) / previousData.length;
    
    // More lenient criteria for testing:
    // 1. Heart rate is at least 5 bpm below recent average (was 7)
    // 2. Stress level is at least 10 points below recent average (was 15)
    // 3. Movement is low (below 25, was 20)
    
    const heartRateDrop = avgHeartRate - data.heartRate;
    const stressLevelDrop = avgStressLevel - data.stressLevel;
    
    return (
      (heartRateDrop >= 5 || stressLevelDrop >= 10) &&
      data.movement < 25
    );
  }

  // Add a new relaxation moment
  private addRelaxationMoment(data: WearableData): void {
    if (!data.location) return;
    
    const moment: RelaxationMoment = {
      id: `relaxation-${Date.now()}`,
      timestamp: data.timestamp,
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      },
      heartRate: data.heartRate,
      stressLevel: data.stressLevel,
    };
    
    this.relaxationMoments.push(moment);
    console.log('Relaxation moment detected:', moment);
    
    // Keep only recent moments (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.relaxationMoments = this.relaxationMoments.filter((m) => m.timestamp >= oneDayAgo);
    
    // Notify listeners
    this.relaxationListeners.forEach((listener) => listener(moment));
  }
}

// Export singleton instance
export const wearableDataService = WearableDataService.getInstance(); 