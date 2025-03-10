import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&auto=format&fit=crop' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>Sam</Text>
        <Text style={styles.age}>28 years</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable 
          style={styles.button}
          onPress={() => router.push('/connect-device')}>
          <Text style={styles.buttonText}>Connect Smartwatch</Text>
        </Pressable>

        <Pressable 
          style={styles.button}
          onPress={() => router.push('/privacy-settings')}>
          <Text style={styles.buttonText}>Privacy Settings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E1F5E9',
    padding: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 4,
  },
  age: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#475569',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: '#475569',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});