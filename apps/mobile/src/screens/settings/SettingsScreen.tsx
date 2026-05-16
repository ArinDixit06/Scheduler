import { Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, uiStyles } from '../../components/common/TeslaUI';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const signOut = useAuthStore((s) => s.signOut);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <ScreenShell title="Settings" subtitle="Theme controls, analytics, notifications, integrations, and sign-out now work.">
      <Panel>
        <SectionTitle title="Theme" />
        <Text style={uiStyles.body}>Current mode: {theme}</Text>
        <TeslaButton label="Light" onPress={() => setTheme('light')} />
        <TeslaButton label="Dark" variant="secondary" onPress={() => setTheme('dark')} />
      </Panel>
      <Panel>
        <SectionTitle title="System" />
        <Pressable onPress={() => navigation.navigate('Integrations')}><Text style={uiStyles.itemTitle}>Integrations</Text></Pressable>
        <Pressable onPress={() => navigation.navigate('NotificationSettings')}><Text style={uiStyles.itemTitle}>Notifications</Text></Pressable>
        <Pressable onPress={() => navigation.navigate('AnalyticsDashboard')}><Text style={uiStyles.itemTitle}>Analytics</Text></Pressable>
      </Panel>
      <TeslaButton label="Sign Out" variant="secondary" onPress={signOut} />
    </ScreenShell>
  );
}
