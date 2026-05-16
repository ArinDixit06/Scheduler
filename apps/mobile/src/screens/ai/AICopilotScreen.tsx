import { Text, View } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';

export function AICopilotScreen() {
  return (
    <ScreenShell title="AI Copilot" subtitle="Gifted chat, quick actions, and structured AI responses are scaffolded here.">
      <View style={section}><Text style={item}>What&apos;s my day?</Text><Text style={item}>Am I overloaded?</Text><Text style={item}>Schedule my tasks</Text></View>
    </ScreenShell>
  );
}

const section = { gap: 8, padding: 16, borderRadius: 18, backgroundColor: '#111933' };
const item = { color: '#d8def0' };
