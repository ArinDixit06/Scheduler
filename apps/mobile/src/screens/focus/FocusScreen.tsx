import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, uiStyles } from '../../components/common/TeslaUI';
import { useFocusStore } from '../../store/focusStore';
import { usePlannerStore } from '../../store/plannerStore';

export function FocusScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { active, mode, minutesLeft, taskTitle, startSession, tick } = useFocusStore();
  const focusHistory = usePlannerStore((s) => s.focusHistory);
  const allTasks = usePlannerStore((s) => s.tasks);
  const [selectedMode, setSelectedMode] = useState<'POMODORO' | 'DEEP_WORK' | 'FLOW'>('POMODORO');
  const tasks = allTasks.filter((task) => task.status !== 'DONE');

  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = setInterval(() => tick(), 60000);
    return () => clearInterval(timer);
  }, [active, tick]);

  return (
    <ScreenShell title="Focus" subtitle="Mode selection, active countdown state, and saved history are now live.">
      <Panel>
        <SectionTitle title="Active session" />
        <Text style={uiStyles.body}>Mode: {active ? mode : selectedMode}</Text>
        <Text style={uiStyles.body}>Task: {taskTitle ?? tasks[0]?.title ?? 'Choose a task'}</Text>
        <Text style={uiStyles.body}>Minutes left: {minutesLeft}</Text>
        <TeslaButton
          label="Start session"
          onPress={() => {
            const minutes = selectedMode === 'DEEP_WORK' ? 50 : selectedMode === 'FLOW' ? 90 : 25;
            startSession(selectedMode, minutes, tasks[0]?.title);
            navigation.navigate('SessionActive');
          }}
        />
        <TeslaButton label="Use Deep Work" variant="secondary" onPress={() => setSelectedMode('DEEP_WORK')} />
      </Panel>
      <Panel>
        <SectionTitle title="History" />
        {focusHistory.map((session) => (
          <Text key={session.id} style={uiStyles.body}>{session.completedAt}: {session.mode} on {session.taskTitle}</Text>
        ))}
      </Panel>
    </ScreenShell>
  );
}
