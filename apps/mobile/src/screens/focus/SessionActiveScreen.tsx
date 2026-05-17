import { useState } from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, TeslaInput, uiStyles } from '../../components/common/TeslaUI';
import { useFocusStore } from '../../store/focusStore';
import { usePlannerStore } from '../../store/plannerStore';

export function SessionActiveScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { isRunning, currentPhase, secondsLeft, linkedTaskName, resetTimer } = useFocusStore();
  const addFocusSession = usePlannerStore((s) => s.addFocusSession);
  const [reflection, setReflection] = useState('');
  const minutesLeft = Math.ceil(secondsLeft / 60);

  return (
    <ScreenShell title="Session Active" subtitle="End the session with a saved reflection that feeds analytics and history.">
      <Panel>
        <SectionTitle title="Current block" />
        <Text style={uiStyles.body}>Status: {isRunning ? 'Running' : 'Idle'}</Text>
        <Text style={uiStyles.body}>Mode: {currentPhase}</Text>
        <Text style={uiStyles.body}>Task: {linkedTaskName ?? 'Unassigned'}</Text>
        <Text style={uiStyles.body}>Minutes left: {minutesLeft}</Text>
      </Panel>
      <Panel>
        <SectionTitle title="Reflection" />
        <TeslaInput value={reflection} onChangeText={setReflection} placeholder="What happened in this session?" />
        <TeslaButton
          label="Complete Session"
          onPress={() => {
            addFocusSession({
              id: `f_${Date.now()}`,
              mode: 'POMODORO',
              taskTitle: linkedTaskName ?? 'General focus',
              plannedMinutes: minutesLeft,
              completedAt: 'Just now',
              reflection: reflection.trim() || 'No reflection added.'
            });
            resetTimer();
            navigation.navigate('FocusHome');
          }}
        />
      </Panel>
    </ScreenShell>
  );
}
