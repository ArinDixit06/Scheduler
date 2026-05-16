import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, TeslaInput, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

const quickActions = ["What's my day?", 'Am I overloaded?', 'Schedule my tasks', 'Summarize last meeting'];

export function AICopilotScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const messages = usePlannerStore((s) => s.aiMessages);
  const quickAIAction = usePlannerStore((s) => s.quickAIAction);
  const sendAIMessage = usePlannerStore((s) => s.sendAIMessage);
  const [draft, setDraft] = useState('');
  const [view, setView] = useState<'Copilot' | 'Suggestions' | 'Planner'>('Copilot');

  return (
    <ScreenShell title="AI Copilot" subtitle="The assistant stays present but understated, surfacing only when it helps.">
      <Panel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(['Copilot', 'Suggestions', 'Planner'] as const).map((item) => (
            <Pressable key={item} onPress={() => setView(item)} style={uiStyles.chip}>
              <Text style={uiStyles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <SectionTitle title="Quick actions" action="Insights" onPress={() => navigation.navigate('Insights')} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {quickActions.map((action) => (
            <Pressable key={action} onPress={() => quickAIAction(action)} style={uiStyles.chip}>
              <Text style={uiStyles.chipText}>{action}</Text>
            </Pressable>
          ))}
        </View>
      </Panel>
      <Panel>
        <SectionTitle title={`Conversation | ${view}`} action="Weekly recap" onPress={() => navigation.navigate('WeeklyRecap')} />
        {messages.slice(-6).map((message) => (
          <View key={message.id}>
            <Text style={uiStyles.itemTitle}>{message.role === 'assistant' ? 'Copilot' : 'You'}</Text>
            <Text style={uiStyles.body}>{message.text}</Text>
          </View>
        ))}
        <TeslaInput value={draft} onChangeText={setDraft} placeholder="Ask a question" />
        <TeslaButton
          label="Send"
          onPress={() => {
            if (draft.trim()) {
              sendAIMessage(draft.trim());
              setDraft('');
            }
          }}
        />
      </Panel>
    </ScreenShell>
  );
}
