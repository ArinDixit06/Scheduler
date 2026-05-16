import { Button, Text, View } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

export function SettingsScreen() {
  const signOut = useAuthStore((s) => s.signOut);
  const setTheme = useAppStore((s) => s.setTheme);
  return (
    <ScreenShell title="Settings" subtitle="Integrations, notifications, theme, export, and account controls.">
      <View style={section}>
        <Text style={item}>Theme</Text>
        <Button title="Light" onPress={() => setTheme('light')} />
        <Button title="Dark" onPress={() => setTheme('dark')} />
        <Button title="System" onPress={() => setTheme('system')} />
        <Button title="Sign Out" onPress={signOut} />
      </View>
    </ScreenShell>
  );
}

const section = { gap: 8, padding: 16, borderRadius: 18, backgroundColor: '#111933' };
const item = { color: '#d8def0' };
