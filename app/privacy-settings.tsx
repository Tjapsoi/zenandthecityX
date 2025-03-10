import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function PrivacySettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.title}>Privacy Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mobile Phone</Text>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Save my location history</Text>
          <Switch />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wearable</Text>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Save my heart rate</Text>
          <Switch />
        </View>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Save my blood saturation</Text>
          <Switch />
        </View>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Save my stress level</Text>
          <Switch />
        </View>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Save my movement patterns</Text>
          <Switch />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1e293b',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#475569',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1e293b',
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#475569',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});