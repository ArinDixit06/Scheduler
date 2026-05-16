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
  return (
    <ScreenShell title="Habits" subtitle="Habit cards now toggle completion and open detail history.">
      <Panel>
        <SectionTitle title="Today" />
        {habits.map((habit) => (
          <View key={habit.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })} style={{ flex: 1 }}>
              <Text style={uiStyles.itemTitle}>{habit.title}</Text>
              <Text style={uiStyles.itemMeta}>Streak {habit.streak} • Reminder {habit.reminderTime}</Text>
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
