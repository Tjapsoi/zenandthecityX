import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Watch } from 'lucide-react-native';

export default function ConnectDeviceScreen() {
  const router = useRouter();

  const handleConnect = () => {
    router.push('/(tabs)');
  };

  const handleSkip = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Zen and the City</Text>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Watch size={32} color="#475569" />
        </View>
        
        <Text style={styles.heading}>
          Connect your smartwatch to collect your information!
        </Text>

        <Text style={styles.disclaimer}>
          Disclaimer: When you connect your smartwatch, we can provide better recommendations. Your personal information obtained from your smartwatch is only stored on your mobile device.
        </Text>

        <Pressable style={styles.connectButton} onPress={handleConnect}>
          <Text style={styles.connectButtonText}>Connect!</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>
            Use the app without connecting your smartwatch!
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
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 12,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  heading: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
  },
  connectButton: {
    backgroundColor: '#475569',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  connectButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#475569',
    textDecorationLine: 'underline',
  },
});