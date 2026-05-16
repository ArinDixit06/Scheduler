import { Button, FlatList, Text, View } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { events, habits, insights, tasks } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';

export function TodayScreen() {
  const userName = useAuthStore((s) => s.userName) ?? 'Apex User';
  return (
    <ScreenShell title={`Good day, ${userName}`} subtitle="Command center for tasks, calendar, habits, and AI.">
      <View style={section}><Text style={heading}>Today</Text><Text style={body}>Energy check-in, quick capture, and focus start are wired into the shell.</Text></View>
      <View style={section}><Text style={heading}>Events</Text>{events.map((e) => <Text key={e.id} style={item}>{e.startAt} {e.title}</Text>)}</View>
      <View style={section}><Text style={heading}>Top Priorities</Text>{tasks.map((t) => <Text key={t.id} style={item}>{t.title}</Text>)}</View>
      <View style={section}><Text style={heading}>Habits</Text>{habits.map((h) => <Text key={h.id} style={item}>{h.title} streak {h.streak}</Text>)}</View>
      <View style={section}><Text style={heading}>AI Insight</Text><Text style={body}>{insights[0].body}</Text></View>
      <Button title="Start Focus Session" onPress={() => undefined} />
    </ScreenShell>
  );
}

const section = { gap: 8, padding: 16, borderRadius: 18, backgroundColor: '#111933', marginBottom: 12 };
const heading = { color: '#fff', fontSize: 18, fontWeight: '700' as const };
const body = { color: '#b8c0d9' };
const item = { color: '#d8def0', paddingVertical: 2 };
