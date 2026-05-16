import { useState } from 'react';
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
  const [energy, setEnergy] = useState(4);
  const tasks = allTasks.filter((task) => task.status !== 'DONE').slice(0, 3);
  const insights = allInsights.filter((insight) => !insight.dismissed);

  return (
    <ScreenShell title={`Hello, ${userName}`} subtitle="Your calm operating surface for today. Review your day, notice what matters, and act in one tap.">
      <Panel>
        <Text style={styles.heroLabel}>APEX DAILY</Text>
        <Text style={styles.heroHeadline}>A quieter plan for the day.</Text>
        <Text style={uiStyles.body}>Open the app, orient quickly, and step into the next right action without wading through a feature grid.</Text>
      </Panel>
      <Panel>
        <SectionTitle title="Energy check-in" />
        <View style={styles.energyRow}>
          {[1, 2, 3, 4, 5].map((score) => (
            <Pressable key={score} style={[styles.energyBubble, energy === score && styles.energySelected]} onPress={() => setEnergy(score)}>
              <Text style={[styles.energyText, energy === score && styles.energyTextSelected]}>{score}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={uiStyles.itemMeta}>
          {energy <= 2 ? 'Low energy. Consider admin work or review.' : energy === 3 ? 'Steady energy. Keep the day balanced.' : 'Good energy. Protect time for meaningful work.'}
        </Text>
      </Panel>
      <Panel>
        <SectionTitle title="Today's events" action="Open calendar" onPress={() => navigation.navigate('More', { screen: 'Calendar' })} />
        {events.map((event) => (
          <Pressable key={event.id} style={styles.listRow} onPress={() => navigation.navigate('More', { screen: 'EventDetail', params: { eventId: event.id } })}>
            <View style={styles.eventLine}>
              <View style={styles.eventDot} />
              <View style={{ flex: 1 }}>
                <Text style={uiStyles.itemTitle}>{event.title}</Text>
                <Text style={uiStyles.itemMeta}>{event.startAt} - {event.endAt}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </Panel>
      <Panel>
        <SectionTitle title="Top priorities" action="All tasks" onPress={() => navigation.navigate('More', { screen: 'Tasks' })} />
        {tasks.map((task) => (
          <Pressable key={task.id} style={styles.listRow} onPress={() => navigation.navigate('More', { screen: 'TaskDetail', params: { taskId: task.id } })}>
            <Text style={uiStyles.itemTitle}>{task.title}</Text>
            <Text style={uiStyles.itemMeta}>{task.projectName} | {task.dueDate} | {task.manualPriority}</Text>
          </Pressable>
        ))}
      </Panel>
      <Panel>
        <SectionTitle title="Habits" action="View all" onPress={() => navigation.navigate('More', { screen: 'Habits' })} />
        <View style={styles.habitRow}>
          {habits.map((habit) => (
            <Pressable key={habit.id} style={styles.habitPill} onPress={() => navigation.navigate('More', { screen: 'HabitDetail', params: { habitId: habit.id } })}>
              <Text style={styles.habitTitle}>{habit.title}</Text>
              <Text style={uiStyles.itemMeta}>{habit.streak} day streak</Text>
            </Pressable>
          ))}
        </View>
      </Panel>
      {insights[0] ? (
        <Panel>
          <SectionTitle title="Workload insight" action="Dismiss" onPress={() => dismissInsight(insights[0].id)} />
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>{insights[0].title}</Text>
            <Text style={uiStyles.body}>{insights[0].body}</Text>
          </View>
          <TeslaButton label="Open Copilot" onPress={() => navigation.navigate('More', { screen: 'AI' })} />
        </Panel>
      ) : null}
      <View style={styles.buttonRow}>
        <TeslaButton label="Quick Capture" variant="secondary" onPress={() => navigation.navigate('Create')} />
        <TeslaButton
          label="Start Focus"
          onPress={() => {
            const task = tasks[0];
            startSession('POMODORO', 25, task?.title);
            navigation.navigate('More', { screen: 'SessionActive' });
          }}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroLabel: {
    color: palette.blue,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  heroHeadline: {
    color: palette.navy,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32
  },
  energyRow: { flexDirection: 'row', gap: 12 },
  energyBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.mist
  },
  energySelected: {
    backgroundColor: palette.blue,
    borderColor: palette.blue
  },
  energyText: { color: palette.graphite, fontWeight: '600' },
  energyTextSelected: { color: palette.white },
  listRow: { gap: 4, paddingVertical: 4 },
  eventLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.blue },
  habitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  habitPill: {
    minWidth: '47%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: palette.mist,
    borderWidth: 1,
    borderColor: '#E8EDF6'
  },
  habitTitle: {
    color: palette.navy,
    fontSize: 15,
    fontWeight: '600'
  },
  insightCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: palette.tint,
    borderWidth: 1,
    borderColor: '#D9E7FF',
    gap: 6
  },
  insightTitle: {
    color: palette.navy,
    fontSize: 16,
    fontWeight: '700'
  },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 12 }
});
