import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, TeslaInput, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function TaskDetailScreen() {
  const route = useRoute<RouteProp<Record<string, { taskId?: string }>, string>>();
  const tasks = usePlannerStore((s) => s.tasks);
  const task = useMemo(() => tasks.find((item) => item.id === route.params?.taskId) ?? tasks[0], [route.params?.taskId, tasks]);
  const completeTask = usePlannerStore((s) => s.completeTask);
  const moveTask = usePlannerStore((s) => s.moveTask);
  const addTaskComment = usePlannerStore((s) => s.addTaskComment);
  const [comment, setComment] = useState('');

  if (!task) {
    return <ScreenShell title="Task Detail"><Text>No task found.</Text></ScreenShell>;
  }

  return (
    <ScreenShell title={task.title} subtitle={task.description}>
      <Panel>
        <SectionTitle title="Task state" />
        <Text style={uiStyles.body}>Status: {task.status}</Text>
        <Text style={uiStyles.body}>Priority: {task.manualPriority} ({task.priority})</Text>
        <Text style={uiStyles.body}>Project: {task.projectName ?? 'Unassigned'}</Text>
        <Text style={uiStyles.body}>Estimate: {task.estimatedMinutes} minutes</Text>
      </Panel>
      <Panel>
        <SectionTitle title="Actions" />
        <TeslaButton label="Mark Done" onPress={() => completeTask(task.id)} />
        <TeslaButton label="Move to In Progress" variant="secondary" onPress={() => moveTask(task.id, 'IN_PROGRESS')} />
      </Panel>
      <Panel>
        <SectionTitle title="Comments" />
        {task.comments.map((item) => <Text key={item} style={uiStyles.body}>{item}</Text>)}
        <TeslaInput value={comment} onChangeText={setComment} placeholder="Add a comment" />
        <Pressable
          onPress={() => {
            if (comment.trim()) {
              addTaskComment(task.id, comment.trim());
              setComment('');
            }
          }}
        >
          <Text style={uiStyles.itemMeta}>Save comment</Text>
        </Pressable>
      </Panel>
    </ScreenShell>
  );
}
