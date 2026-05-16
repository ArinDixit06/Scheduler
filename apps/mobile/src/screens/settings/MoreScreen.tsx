import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, uiStyles } from '../../components/common/TeslaUI';
import { palette } from '../../constants/theme';

const groups = [
  {
    title: 'Plan',
    items: [
      { label: 'Tasks', route: 'Tasks', note: 'Today, upcoming, and completed work' },
      { label: 'Calendar', route: 'Calendar', note: 'Month, week, and agenda planning' },
      { label: 'Habits', route: 'Habits', note: 'Active habits, streaks, and history' }
    ]
  },
  {
    title: 'Focus',
    items: [
      { label: 'Focus', route: 'Focus', note: 'Sessions, timer, and protected work blocks' },
      { label: 'AI', route: 'AI', note: 'Copilot, suggestions, and planning support' },
      { label: 'AnalyticsDashboard', route: 'AnalyticsDashboard', note: 'Reports and trends' }
    ]
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Settings', route: 'Settings', note: 'Appearance and account controls' },
      { label: 'Integrations', route: 'Integrations', note: 'Connected calendars and tools' },
      { label: 'NotificationSettings', route: 'NotificationSettings', note: 'Alerts, digests, and reminders' }
    ]
  }
];

export function MoreScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <ScreenShell title="More" subtitle="Secondary destinations live here so the main dock stays quiet and easy to scan.">
      {groups.map((group) => (
        <Panel key={group.title}>
          <SectionTitle title={group.title} />
          {group.items.map((item) => (
            <Pressable key={item.route} onPress={() => navigation.navigate(item.route)} style={styles.row}>
              <View style={styles.iconDot} />
              <View style={styles.textWrap}>
                <Text style={uiStyles.itemTitle}>{item.label}</Text>
                <Text style={uiStyles.itemMeta}>{item.note}</Text>
              </View>
            </Pressable>
          ))}
        </Panel>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8
  },
  iconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.blue
  },
  textWrap: {
    flex: 1,
    gap: 2
  }
});
