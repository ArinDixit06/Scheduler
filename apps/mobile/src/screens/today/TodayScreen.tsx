import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, uiStyles } from '../../components/common/TeslaUI';
import { useAuthStore } from '../../store/authStore';
import { usePlannerStore } from '../../store/plannerStore';
import { useFocusStore } from '../../store/focusStore';
import { palette } from '../../constants/theme';

export function TodayScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const userName = useAuthStore((s) => s.userName) ?? 'Apex User';
  const allTasks = usePlannerStore((s) => s.tasks);
  const habits = usePlannerStore((s) => s.habits);
  const events = usePlannerStore((s) => s.events);
  const allInsights = usePlannerStore((s) => s.insights);
  const dismissInsight = usePlannerStore((s) => s.dismissInsight);
  const startSession = useFocusStore((s) => s.startSession);
  const tasks = allTasks.filter((task) => task.status !== 'DONE').slice(0, 3);
  const insights = allInsights.filter((insight) => !insight.dismissed);

  return (
    <ScreenShell title={`Good day, ${userName}`} subtitle="A photography-first command center with live tasks, events, habits, and focus actions.">
      <Panel>
        <SectionTitle title="Energy check-in" />
        <View style={styles.energyRow}>
          {['1', '2', '3', '4', '5'].map((score) => (
            <Pressable key={score} style={styles.energyBubble}>
              <Text style={styles.energyText}>{score}</Text>
            </Pressable>
          ))}
        </View>
      </Panel>
      <Panel>
        <SectionTitle title="Today's events" action="Open calendar" onPress={() => navigation.navigate('Calendar')} />
        {events.map((event) => (
          <Pressable key={event.id} style={styles.listRow} onPress={() => navigation.navigate('Calendar', { screen: 'EventDetail', params: { eventId: event.id } })}>
            <Text style={uiStyles.itemTitle}>{event.title}</Text>
            <Text style={uiStyles.itemMeta}>{event.startAt} - {event.endAt}</Text>
          </Pressable>
        ))}
      </Panel>
      <Panel>
        <SectionTitle title="Top priorities" action="All tasks" onPress={() => navigation.navigate('Tasks')} />
        {tasks.map((task) => (
          <Pressable key={task.id} style={styles.listRow} onPress={() => navigation.navigate('Tasks', { screen: 'TaskDetail', params: { taskId: task.id } })}>
            <Text style={uiStyles.itemTitle}>{task.title}</Text>
            <Text style={uiStyles.itemMeta}>{task.projectName} | {task.dueDate}</Text>
          </Pressable>
        ))}
      </Panel>
      <Panel>
        <SectionTitle title="Habits" action="View all" onPress={() => navigation.navigate('Habits')} />
        <View style={styles.habitRow}>
          {habits.map((habit) => (
            <Pressable key={habit.id} style={styles.habitPill} onPress={() => navigation.navigate('Habits', { screen: 'HabitDetail', params: { habitId: habit.id } })}>
              <Text style={uiStyles.itemMeta}>{habit.title} | {habit.streak}</Text>
            </Pressable>
          ))}
        </View>
      </Panel>
      {insights[0] ? (
        <Panel>
          <SectionTitle title={insights[0].title} action="Dismiss" onPress={() => dismissInsight(insights[0].id)} />
          <Text style={uiStyles.body}>{insights[0].body}</Text>
          <TeslaButton label="Open Copilot" onPress={() => navigation.navigate('AI')} />
        </Panel>
      ) : null}
      <View style={styles.buttonRow}>
        <TeslaButton label="Quick Capture" variant="secondary" onPress={() => navigation.navigate('Tasks', { screen: 'NewTask' })} />
        <TeslaButton
          label="Start Focus"
          onPress={() => {
            const task = tasks[0];
            startSession('POMODORO', 25, task?.title);
            navigation.navigate('Focus', { screen: 'SessionActive' });
          }}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  energyRow: { flexDirection: 'row', gap: 12 },
  energyBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center'
  },
  energyText: { color: palette.graphite, fontWeight: '500' },
  listRow: { gap: 4, paddingVertical: 4 },
  habitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  habitPill: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: palette.line },
  buttonRow: { flexDirection: 'row', gap: 10 }
});
