import { Text, View } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { habits } from '../../data/mockData';

export function HabitsScreen() {
  return (
    <ScreenShell title="Habits" subtitle="Grid, streaks, logging, and history views are represented in the app shell.">
      <View style={section}>{habits.map((habit) => <Text key={habit.id} style={item}>{habit.title} · streak {habit.streak}</Text>)}</View>
    </ScreenShell>
  );
}

const section = { gap: 8, padding: 16, borderRadius: 18, backgroundColor: '#111933' };
const item = { color: '#d8def0' };
