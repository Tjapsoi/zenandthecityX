import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { RelaxationMoment } from './WearableDataService';
import { ZenPlace } from '../data/zenPlaces';
import { getRecommendedPlaces } from './OpenStreetMapService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications defaults
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Cache to prevent duplicate notifications for the same moment
const notifiedMoments = new Set<string>();

// Storage key for user feedback
const RELAXATION_FEEDBACK_KEY = 'relaxation_feedback';

// Interface for storing feedback data
interface FeedbackData {
  momentId: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  wasRelaxing: boolean;
  nearbyPlace?: string;
}

/**
 * Service to handle relaxation notifications
 */
class NotificationService {
  private static instance: NotificationService;
  private notificationListener: any = null;
  private responseListener: any = null;
  private isInitialized = false;
  private feedbackData: FeedbackData[] = [];
  
  private constructor() {
    console.log('NotificationService created');
  }
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  /**
   * Initialize the notification service
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    console.log('Initializing notification service');
    
    // Load previous feedback data
    try {
      await this.loadFeedbackData();
    } catch (error) {
      console.error('Error loading feedback data:', error);
    }
    
    // Register notification handlers
    try {
      this.registerNotificationHandlers();
    } catch (error) {
      console.error('Error registering notification handlers:', error);
    }
    
    // Check for permissions
    try {
      const permissionResult = await this.requestPermissions();
      this.isInitialized = permissionResult;
      
      if (permissionResult) {
        console.log('Notification permissions granted');
      } else {
        console.log('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      this.isInitialized = false;
    }
    
    return this.isInitialized;
  }
  
  /**
   * Cleanup listeners when the app is closed
   */
  public cleanup(): void {
    console.log('Cleaning up notification service');
    
    try {
      if (this.notificationListener) {
        Notifications.removeNotificationSubscription(this.notificationListener);
        this.notificationListener = null;
      }
      
      if (this.responseListener) {
        Notifications.removeNotificationSubscription(this.responseListener);
        this.responseListener = null;
      }
    } catch (error) {
      console.error('Error cleaning up notification listeners:', error);
    }
  }
  
  /**
   * Send a notification for a relaxation moment
   */
  public async sendRelaxationNotification(moment: RelaxationMoment, preferencesCriteriaMet: boolean = false): Promise<string | null> {
    console.log('Sending relaxation notification for moment:', moment.id);
    
    // Don't notify for the same moment twice
    if (notifiedMoments.has(moment.id)) {
      console.log('Moment already notified, skipping:', moment.id);
      return null;
    }
    
    // Add to notified moments cache
    notifiedMoments.add(moment.id);
    
    // If location is available, try to find a nearby place
    if (moment.location && !moment.nearbyPlace) {
      try {
        // Get nearby places - simplified version for demo
        const places = await getRecommendedPlaces({
          nature: 5,
          quiet: 5,
          indoor: 5,
          outdoor: 5,
          social: 5,
          solitude: 5,
          activity: 5,
          meditation: 7, // Prefer meditation places
          water: 5,
          urban: 5,
          parks: true,
          gardens: false,
          cafes: false,
          libraries: false,
          museums: false,
          wellness: false,
          viewpoints: false,
          waterfront: false,
          temples: true,
          historic: false
        }, [], 1);
        
        if (places.length > 0) {
          moment.nearbyPlace = places[0];
          console.log('Found nearby place:', places[0].name);
        }
      } catch (error) {
        console.error('Error finding nearby place:', error);
      }
    }
    
    // Format the time
    const time = new Date(moment.timestamp);
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create notification content
    const content: Notifications.NotificationContentInput = {
      title: 'Zen Moment Detected',
      body: moment.nearbyPlace
        ? `You seemed particularly relaxed at ${timeString} near ${moment.nearbyPlace.name}. Was this a good moment for you?`
        : `You seemed particularly relaxed at ${timeString}. Was this a good moment for you?`,
      data: { moment },
      categoryIdentifier: 'relaxationFeedback',
    };
    
    // Add the relaxation moment data to the notification
    try {
      console.log('Scheduling notification with content:', JSON.stringify(content));
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: null, // Send immediately
      });
      
      console.log('Notification scheduled with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }
  
  /**
   * Store feedback about a relaxation moment
   */
  public async storeFeedback(momentId: string, wasRelaxing: boolean): Promise<void> {
    console.log(`Storing feedback for moment ${momentId}: ${wasRelaxing ? 'Relaxing' : 'Not relaxing'}`);
    
    try {
      // Find the moment in the notified moments
      const notificationData = await Notifications.getPresentedNotificationsAsync();
      console.log('Current notifications:', notificationData.length);
      
      const notification = notificationData.find(n => {
        if (!n.request.content.data) return false;
        const data = n.request.content.data as any;
        return data.moment && data.moment.id === momentId;
      });
      
      if (notification) {
        console.log('Found notification for moment:', momentId);
        const moment = notification.request.content.data.moment as RelaxationMoment;
        
        // Store the feedback
        const feedbackEntry: FeedbackData = {
          momentId,
          timestamp: moment.timestamp,
          location: moment.location,
          wasRelaxing,
          nearbyPlace: moment.nearbyPlace?.name,
        };
        
        this.feedbackData.push(feedbackEntry);
        
        // Save to AsyncStorage
        await this.saveFeedbackData();
        
        // Remove the notification
        await Notifications.dismissNotificationAsync(notification.request.identifier);
        console.log('Notification dismissed:', notification.request.identifier);
      } else {
        console.log('Notification not found for moment:', momentId);
        
        // Store minimal feedback anyway
        const feedbackEntry: FeedbackData = {
          momentId,
          timestamp: Date.now(),
          location: { latitude: 0, longitude: 0 },
          wasRelaxing,
        };
        
        this.feedbackData.push(feedbackEntry);
        await this.saveFeedbackData();
      }
    } catch (error) {
      console.error('Error storing feedback:', error);
    }
  }
  
  /**
   * Get all feedback data for analysis
   */
  public getFeedbackData(): FeedbackData[] {
    return [...this.feedbackData];
  }
  
  /**
   * Register handlers for incoming notifications and responses
   */
  private registerNotificationHandlers(): void {
    console.log('Registering notification handlers');
    
    // Handle notification received while app is in foreground
    try {
      this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received in foreground:', notification);
      });
      
      // Handle notification interaction (taps)
      this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response received:', response);
        
        // Get the user action
        const actionIdentifier = response.actionIdentifier;
        
        if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          console.log('Default action (tap) received');
          // Handle default tap
          const momentId = response.notification.request.content.data?.moment?.id;
          if (momentId) {
            this.handleDefaultResponse(momentId);
          }
        } else if (actionIdentifier === 'yes') {
          console.log('Yes action received');
          this.handleYesResponse(response.notification.request.content.data?.moment?.id);
        } else if (actionIdentifier === 'no') {
          console.log('No action received');
          this.handleNoResponse(response.notification.request.content.data?.moment?.id);
        }
      });
      
      // Set up notification categories with actions
      Notifications.setNotificationCategoryAsync('relaxationFeedback', [
        {
          identifier: 'yes',
          buttonTitle: 'Yes ✅',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'no',
          buttonTitle: 'No ❌',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
      ]);
    } catch (error) {
      console.error('Error setting up notification handlers:', error);
    }
  }
  
  /**
   * Handle default response (tap on notification)
   */
  private async handleDefaultResponse(momentId?: string): Promise<void> {
    console.log('Handling default response for moment:', momentId);
    // For now, treat default action as a "yes"
    if (momentId) {
      await this.storeFeedback(momentId, true);
    }
  }
  
  /**
   * Handle "Yes" responses from notifications
   */
  private async handleYesResponse(momentId?: string): Promise<void> {
    console.log('Handling YES response for moment:', momentId);
    if (momentId) {
      await this.storeFeedback(momentId, true);
    }
  }
  
  /**
   * Handle "No" responses from notifications
   */
  private async handleNoResponse(momentId?: string): Promise<void> {
    console.log('Handling NO response for moment:', momentId);
    if (momentId) {
      await this.storeFeedback(momentId, false);
    }
  }
  
  /**
   * Request notification permissions
   */
  private async requestPermissions(): Promise<boolean> {
    console.log('Requesting notification permissions');
    
    // On web, we don't need device checks
    if (Platform.OS === 'web') {
      console.log('Web platform detected, skipping device check');
      return true;
    }
    
    // Check if on a physical device
    if (!Device.isDevice) {
      console.log('Not a physical device, notifications may not work in emulator');
      // Continue anyway for testing
    }
    
    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      console.log('Existing notification permission status:', existingStatus);
      
      // Request permissions if not already granted
      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('New notification permission status:', status);
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
  
  /**
   * Save feedback data to AsyncStorage
   */
  private async saveFeedbackData(): Promise<void> {
    try {
      await AsyncStorage.setItem(RELAXATION_FEEDBACK_KEY, JSON.stringify(this.feedbackData));
      console.log('Feedback data saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving feedback data:', error);
    }
  }
  
  /**
   * Load feedback data from AsyncStorage
   */
  private async loadFeedbackData(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(RELAXATION_FEEDBACK_KEY);
      if (data) {
        this.feedbackData = JSON.parse(data);
        console.log(`Loaded ${this.feedbackData.length} feedback items from AsyncStorage`);
      } else {
        console.log('No feedback data found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading feedback data:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance(); 