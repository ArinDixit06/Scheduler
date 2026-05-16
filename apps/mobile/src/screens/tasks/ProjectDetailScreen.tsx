import { Text } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function ProjectDetailScreen() {
  const tasks = usePlannerStore((s) => s.tasks);
  const byProject = tasks.reduce<Record<string, number>>((acc, task) => {
    const key = task.projectName ?? 'Unassigned';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <ScreenShell title="Project Snapshot" subtitle="Grouped task counts by current project membership.">
      <Panel>
        <SectionTitle title="Projects" />
        {Object.entries(byProject).map(([name, count]) => (
          <Text key={name} style={uiStyles.body}>{name}: {count} tasks</Text>
        ))}
      </Panel>
    </ScreenShell>
  );
}
