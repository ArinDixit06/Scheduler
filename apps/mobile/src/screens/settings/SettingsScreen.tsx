import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
  const [view, setView] = useState<'Account' | 'Notifications' | 'Appearance'>('Appearance');

  return (
    <ScreenShell title="Settings" subtitle="Less frequent controls stay here so the main product surfaces remain calm.">
      <Panel>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Account', 'Notifications', 'Appearance'] as const).map((item) => (
            <Pressable key={item} onPress={() => setView(item)} style={uiStyles.chip}>
              <Text style={uiStyles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <SectionTitle title="Theme" />
        <Text style={uiStyles.body}>Current mode: {theme} | Section: {view}</Text>
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
