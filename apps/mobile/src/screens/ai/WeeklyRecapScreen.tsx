import { Text } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function WeeklyRecapScreen() {
  const tasks = usePlannerStore((s) => s.tasks);
  const habits = usePlannerStore((s) => s.habits);
  const doneCount = tasks.filter((task) => task.status === 'DONE').length;
  const habitHits = habits.filter((habit) => habit.completedToday).length;

  return (
    <ScreenShell title="Weekly Recap" subtitle="A computed recap from current local planner state.">
      <Panel>
        <SectionTitle title="Summary" />
        <Text style={uiStyles.body}>{doneCount} tasks completed so far.</Text>
        <Text style={uiStyles.body}>{habitHits} habits logged today.</Text>
        <Text style={uiStyles.body}>Top theme: protect long focus blocks before meetings expand.</Text>
      </Panel>
    </ScreenShell>
  );
}
