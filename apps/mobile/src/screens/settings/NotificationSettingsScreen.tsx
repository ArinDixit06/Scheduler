import { View, Text } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function NotificationSettingsScreen() {
  const prefs = usePlannerStore((s) => s.notificationPrefs);
  const setNotificationPref = usePlannerStore((s) => s.setNotificationPref);

  return (
    <ScreenShell title="Notifications" subtitle="Preference toggles persist in local planner state.">
      <Panel>
        <SectionTitle title="Preferences" />
        {Object.entries(prefs).map(([key, value]) => (
          <View key={key} style={{ gap: 4 }}>
            <Text style={uiStyles.itemTitle}>{key}</Text>
            <Text style={uiStyles.itemMeta}>{value ? 'Enabled' : 'Disabled'}</Text>
            <TeslaButton label={value ? 'Disable' : 'Enable'} onPress={() => setNotificationPref(key as keyof typeof prefs, !value)} />
          </View>
        ))}
      </Panel>
    </ScreenShell>
  );
}
