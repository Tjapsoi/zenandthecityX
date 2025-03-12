import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, defaultPreferences, questions } from '../types/preferences';
import { usePreferences } from '../context/PreferencesContext';

export default function QuestionnaireScreen() {
  const { updatePreferences, setHasCompletedQuestionnaire } = usePreferences();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({...defaultPreferences});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  
  const totalQuestions = questions.length;
  const question = questions[currentQuestion];
  
  const handleSliderChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      // Update the preference for the current question
      setPreferences(prev => ({
        ...prev,
        [question.preferenceKey]: numValue
      }));
    }
  };
  
  const handleChoiceSelection = (option: string) => {
    // Different preference updates based on the selected choice
    let updatedPrefs: Partial<UserPreferences> = {};
    
    switch(option) {
      case 'Peaceful Nature':
        updatedPrefs = { 
          nature: 9, 
          quiet: 8, 
          outdoor: 8, 
          social: 3, 
          solitude: 7 
        };
        break;
      case 'Quiet Indoors':
        updatedPrefs = { 
          indoor: 9, 
          quiet: 9, 
          outdoor: 2, 
          social: 3, 
          solitude: 8 
        };
        break;
      case 'Active Outdoors':
        updatedPrefs = { 
          outdoor: 9, 
          activity: 8, 
          nature: 7, 
          quiet: 4, 
          social: 6 
        };
        break;
      case 'Social Setting':
        updatedPrefs = { 
          social: 9, 
          solitude: 2, 
          indoor: 6, 
          urban: 7, 
          activity: 6 
        };
        break;
      case 'Meditative Space':
        updatedPrefs = { 
          meditation: 9, 
          quiet: 9, 
          solitude: 7, 
          nature: 6, 
          water: 7 
        };
        break;
    }
    
    setPreferences(prev => ({
      ...prev,
      ...updatedPrefs
    }));
  };
  
  const handleCheckboxToggle = (option: string) => {
    // Toggle the selected state for the option
    const isSelected = !selectedOptions[option];
    
    setSelectedOptions(prev => ({
      ...prev,
      [option]: isSelected
    }));
    
    // Map the option to the corresponding preference key
    const optionToPrefKey: Record<string, keyof UserPreferences> = {
      'Parks': 'parks',
      'Gardens': 'gardens',
      'Cafes': 'cafes',
      'Libraries': 'libraries',
      'Museums': 'museums',
      'Wellness Centers': 'wellness',
      'Viewpoints': 'viewpoints',
      'Waterfront': 'waterfront',
      'Temples': 'temples',
      'Historic Sites': 'historic'
    };
    
    // Update the preference if there's a direct mapping
    const prefKey = optionToPrefKey[option];
    if (prefKey) {
      setPreferences(prev => ({
        ...prev,
        [prefKey]: isSelected
      }));
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuestionnaire();
    }
  };
  
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const completeQuestionnaire = async () => {
    try {
      // Update preferences in context and AsyncStorage
      updatePreferences(preferences);
      
      // Mark questionnaire as completed
      setHasCompletedQuestionnaire(true);
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing questionnaire:', error);
      alert('There was an error saving your preferences. Please try again.');
    }
  };
  
  const renderQuestionContent = () => {
    const question = questions[currentQuestion];
    
    switch (question.type) {
      case 'slider':
        const value = preferences[question.preferenceKey] as number;
        return (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderInputContainer}>
              <TouchableOpacity 
                style={styles.sliderButton}
                onPress={() => handleSliderChange(Math.max(1, value - 1).toString())}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              
              <TextInput
                style={styles.sliderInput}
                value={value.toString()}
                onChangeText={handleSliderChange}
                keyboardType="numeric"
                maxLength={2}
              />
              
              <TouchableOpacity 
                style={styles.sliderButton}
                onPress={() => handleSliderChange(Math.min(10, value + 1).toString())}
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1</Text>
              <Text style={styles.sliderLabel}>5</Text>
              <Text style={styles.sliderLabel}>10</Text>
            </View>
            
            <Text style={styles.sliderValue}>Selected: {value}</Text>
          </View>
        );
        
      case 'choices':
        return (
          <View style={styles.choicesContainer}>
            {question.options?.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.choiceButton,
                  preferences[question.preferenceKey] === 9 && 
                  (
                    (option === 'Peaceful Nature' && preferences.nature === 9) ||
                    (option === 'Quiet Indoors' && preferences.indoor === 9) ||
                    (option === 'Active Outdoors' && preferences.outdoor === 9) ||
                    (option === 'Social Setting' && preferences.social === 9) ||
                    (option === 'Meditative Space' && preferences.meditation === 9)
                  ) ? styles.selectedChoice : {}
                ]}
                onPress={() => handleChoiceSelection(option)}
              >
                <Text style={styles.choiceText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
        
      case 'multiselect':
        return (
          <View style={styles.checkboxContainer}>
            {question.options?.map((option) => {
              const prefKey = option === 'Parks' ? 'parks' :
                              option === 'Gardens' ? 'gardens' :
                              option === 'Cafes' ? 'cafes' :
                              option === 'Libraries' ? 'libraries' :
                              option === 'Museums' ? 'museums' :
                              option === 'Wellness Centers' ? 'wellness' :
                              option === 'Viewpoints' ? 'viewpoints' :
                              option === 'Waterfront' ? 'waterfront' :
                              option === 'Temples' ? 'temples' :
                              option === 'Historic Sites' ? 'historic' : undefined;
              
              const isSelected = prefKey ? preferences[prefKey] as boolean : selectedOptions[option] || false;
              
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.checkbox, isSelected ? styles.checkedBox : {}]}
                  onPress={() => handleCheckboxToggle(option)}
                >
                  <Text style={isSelected ? styles.checkedText : styles.checkboxText}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Zen Preferences</Text>
        <Text style={styles.subtitle}>Question {currentQuestion + 1} of {totalQuestions}</Text>
        
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{question.text}</Text>
          <Text style={styles.description}>{question.description}</Text>
          
          {renderQuestionContent()}
        </View>
        
        <View style={styles.buttonContainer}>
          {currentQuestion > 0 && (
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={prevQuestion}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={nextQuestion}
          >
            <Text style={styles.buttonText}>
              {currentQuestion === totalQuestions - 1 ? 'Complete' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={completeQuestionnaire}
        >
          <Text style={styles.skipButtonText}>Skip Questionnaire</Text>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#1e293b',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
    fontFamily: 'Inter-Regular',
  },
  questionContainer: {
    marginBottom: 30,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
    fontFamily: 'Inter-SemiBold',
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  sliderContainer: {
    marginVertical: 20,
  },
  sliderInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    marginHorizontal: 10,
    color: '#22c55e',
    fontFamily: 'Inter-SemiBold',
  },
  sliderButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderLabel: {
    color: '#64748b',
    fontFamily: 'Inter-Regular',
  },
  sliderValue: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#22c55e',
  },
  choicesContainer: {
    marginVertical: 20,
  },
  choiceButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedChoice: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  choiceText: {
    color: '#1e293b',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 20,
  },
  checkbox: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  checkedBox: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  checkboxText: {
    color: '#64748b',
    fontFamily: 'Inter-SemiBold',
  },
  checkedText: {
    color: '#166534',
    fontFamily: 'Inter-SemiBold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
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
  skipButton: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 10,
  },
  skipButtonText: {
    color: '#64748b',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
}); 