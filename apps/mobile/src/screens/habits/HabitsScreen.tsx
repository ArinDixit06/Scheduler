import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, TeslaInput, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function HabitsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const habits = usePlannerStore((s) => s.habits);
  const toggleHabit = usePlannerStore((s) => s.toggleHabit);
  const addHabit = usePlannerStore((s) => s.addHabit);
  const [title, setTitle] = useState('');
  const [view, setView] = useState<'Active' | 'Streaks' | 'History'>('Active');

  return (
    <ScreenShell title="Habits" subtitle="A lighter module for continuity, consistency, and low-pressure progress.">
      <Panel>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Active', 'Streaks', 'History'] as const).map((item) => (
            <Pressable key={item} onPress={() => setView(item)} style={uiStyles.chip}>
              <Text style={uiStyles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <SectionTitle title="Today" />
        {habits.map((habit) => (
          <View key={habit.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })} style={{ flex: 1 }}>
              <Text style={uiStyles.itemTitle}>{habit.title}</Text>
              <Text style={uiStyles.itemMeta}>Streak {habit.streak} | Reminder {habit.reminderTime} | {view}</Text>
            </Pressable>
            <TeslaButton label={habit.completedToday ? 'Undo' : 'Log'} onPress={() => toggleHabit(habit.id)} />
          </View>
        ))}
      </Panel>
      <Panel>
        <SectionTitle title="Add habit" />
        <TeslaInput value={title} onChangeText={setTitle} placeholder="Habit title" />
        <TeslaButton
          label="Add Daily Habit"
          onPress={() => {
            if (title.trim()) {
              addHabit(title.trim(), '7:00 AM');
              setTitle('');
            }
          }}
        />
      </Panel>
    </ScreenShell>
  );
}
