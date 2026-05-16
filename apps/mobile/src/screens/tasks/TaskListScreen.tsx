import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';
import type { TaskStatus } from '../../types';
import { palette } from '../../constants/theme';

const segments: Array<{ label: string; statuses: TaskStatus[] }> = [
  { label: 'Inbox', statuses: ['INBOX'] },
  { label: 'Today', statuses: ['TODO', 'IN_PROGRESS'] },
  { label: 'Done', statuses: ['DONE'] }
];

export function TaskListScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [active, setActive] = useState('Today');
  const tasks = usePlannerStore((s) => s.tasks);
  const completeTask = usePlannerStore((s) => s.completeTask);
  const visibleTasks = useMemo(() => {
    const segment = segments.find((item) => item.label === active);
    return tasks.filter((task) => segment?.statuses.includes(task.status));
  }, [active, tasks]);

  return (
    <ScreenShell title="Tasks" subtitle="Segmented task control, real status mutation, and functional detail screens.">
      <Panel>
        <SectionTitle title="Views" action="Create task" onPress={() => navigation.navigate('NewTask')} />
        <View style={styles.segmentRow}>
          {segments.map((segment) => (
            <Pressable key={segment.label} onPress={() => setActive(segment.label)} style={[styles.segment, active === segment.label && styles.segmentActive]}>
              <Text style={[styles.segmentText, active === segment.label && styles.segmentTextActive]}>{segment.label}</Text>
            </Pressable>
          ))}
        </View>
      </Panel>
      <Panel>
        <SectionTitle title={`${active} tasks`} />
        {visibleTasks.map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <Pressable style={{ flex: 1, gap: 4 }} onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}>
              <Text style={uiStyles.itemTitle}>{task.title}</Text>
              <Text style={uiStyles.itemMeta}>{task.projectName} • {task.manualPriority} • {task.dueDate}</Text>
            </Pressable>
            {task.status !== 'DONE' ? <TeslaButton label="Done" onPress={() => completeTask(task.id)} /> : null}
          </View>
        ))}
      </Panel>
      <TeslaButton label="Project snapshot" variant="secondary" onPress={() => navigation.navigate('ProjectDetail')} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  segmentRow: { flexDirection: 'row', gap: 8 },
  segment: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: palette.line, borderRadius: 4 },
  segmentActive: { backgroundColor: palette.blue, borderColor: palette.blue },
  segmentText: { color: palette.graphite, fontSize: 14 },
  segmentTextActive: { color: palette.white, fontWeight: '500' },
  taskRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 6 }
});
