import { Button, Text, View } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { useFocusStore } from '../../store/focusStore';

export function FocusScreen() {
  const { active, minutesLeft, startSession, endSession } = useFocusStore();
  return (
    <ScreenShell title="Focus" subtitle="Pomodoro, deep work, ring timer, and session log shell.">
      <View style={section}>
        <Text style={item}>Session status: {active ? `${minutesLeft} min left` : 'idle'}</Text>
        <Button title="Start Pomodoro" onPress={() => startSession('POMODORO', 25)} />
        <Button title="End Session" onPress={endSession} />
      </View>
    </ScreenShell>
  );
}

const section = { gap: 12, padding: 16, borderRadius: 18, backgroundColor: '#111933' };
const item = { color: '#d8def0' };
