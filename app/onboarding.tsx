import { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to Zen in the City',
    description: 'Embark on a journey to discover inner peace and vitality, through quiet places in the city.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Discover',
    description: 'This app gently tracks and keeps record of your quiet moments.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Connect and Grow',
    description: 'Connect your smartwatch to collect more targeted information on your body.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=60'
  }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/connect-device');
    }
  };

  const handleSkip = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{ uri: ONBOARDING_STEPS[currentStep].image }}
          style={styles.image}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>{ONBOARDING_STEPS[currentStep].title}</Text>
        <Text style={styles.description}>{ONBOARDING_STEPS[currentStep].description}</Text>

        <View style={styles.dotsContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentStep === index && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Start!' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E1F5E9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  image: {
    width: 240,
    height: 240,
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    backgroundColor: '#475569',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  skipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#475569',
  },
  nextButton: {
    backgroundColor: '#475569',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});