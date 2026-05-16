import { Button, Text, View } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { tasks } from '../../data/mockData';

export function TaskListScreen() {
  return (
    <ScreenShell title="Tasks" subtitle="Inbox, Today, Upcoming, Projects, filters, and bulk actions are represented here.">
      <View style={section}>
        {tasks.map((task) => (
          <Text key={task.id} style={item}>{task.title} · {task.manualPriority}</Text>
        ))}
      </View>
      <Button title="New Task" onPress={() => undefined} />
    </ScreenShell>
  );
}

const section = { gap: 8, padding: 16, borderRadius: 18, backgroundColor: '#111933' };
const item = { color: '#d8def0' };
