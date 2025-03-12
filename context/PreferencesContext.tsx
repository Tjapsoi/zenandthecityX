import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, defaultPreferences } from '../types/preferences';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  hasCompletedQuestionnaire: boolean;
  setHasCompletedQuestionnaire: (completed: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

  // Load preferences from storage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPrefs = await AsyncStorage.getItem('userPreferences');
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs));
        }

        const completed = await AsyncStorage.getItem('completedQuestionnaire');
        if (completed === 'true') {
          setHasCompletedQuestionnaire(true);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to storage when they change
  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      setPreferences(updatedPrefs);
      await AsyncStorage.setItem('userPreferences', JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const setCompletedQuestionnaire = async (completed: boolean) => {
    setHasCompletedQuestionnaire(completed);
    await AsyncStorage.setItem('completedQuestionnaire', completed ? 'true' : 'false');
  };

  return (
    <PreferencesContext.Provider 
      value={{ 
        preferences, 
        updatePreferences, 
        hasCompletedQuestionnaire, 
        setHasCompletedQuestionnaire: setCompletedQuestionnaire 
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
} 