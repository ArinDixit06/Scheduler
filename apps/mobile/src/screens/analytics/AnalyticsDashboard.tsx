import { Text } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function AnalyticsDashboard() {
  const tasks = usePlannerStore((s) => s.tasks);
  const focusHistory = usePlannerStore((s) => s.focusHistory);
  const habits = usePlannerStore((s) => s.habits);

  return (
    <ScreenShell title="Analytics" subtitle="Simple live metrics for tasks, habits, and focus output.">
      <Panel>
        <SectionTitle title="Tasks" />
        <Text style={uiStyles.body}>Open: {tasks.filter((task) => task.status !== 'DONE').length}</Text>
        <Text style={uiStyles.body}>Completed: {tasks.filter((task) => task.status === 'DONE').length}</Text>
      </Panel>
      <Panel>
        <SectionTitle title="Focus" />
        <Text style={uiStyles.body}>Sessions logged: {focusHistory.length}</Text>
      </Panel>
      <Panel>
        <SectionTitle title="Habits" />
        <Text style={uiStyles.body}>Completed today: {habits.filter((habit) => habit.completedToday).length}</Text>
      </Panel>
    </ScreenShell>
  );
}
