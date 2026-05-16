import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function HabitDetailScreen() {
  const route = useRoute<RouteProp<Record<string, { habitId?: string }>, string>>();
  const habits = usePlannerStore((s) => s.habits);
  const habit = useMemo(() => habits.find((item) => item.id === route.params?.habitId) ?? habits[0], [habits, route.params?.habitId]);

  if (!habit) {
    return <ScreenShell title="Habit Detail"><Text>No habit found.</Text></ScreenShell>;
  }

  return (
    <ScreenShell title={habit.title} subtitle={`Reminder at ${habit.reminderTime}`}>
      <Panel>
        <SectionTitle title="Progress" />
        <Text style={uiStyles.body}>Current streak: {habit.streak}</Text>
        <Text style={uiStyles.body}>Completed today: {habit.completedToday ? 'Yes' : 'No'}</Text>
      </Panel>
      <Panel>
        <SectionTitle title="Weekly heatmap" />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {habit.weeklyCompletions.map((value, index) => (
            <View key={`${habit.id}-${index}`} style={{ width: 18, height: 18, backgroundColor: value ? habit.color : '#EEEEEE', borderRadius: 4 }} />
          ))}
        </View>
      </Panel>
      <Panel>
        <SectionTitle title="Notes" />
        {habit.notes.length ? habit.notes.map((note) => <Text key={note} style={uiStyles.body}>{note}</Text>) : <Text style={uiStyles.body}>No notes yet.</Text>}
      </Panel>
    </ScreenShell>
  );
}
