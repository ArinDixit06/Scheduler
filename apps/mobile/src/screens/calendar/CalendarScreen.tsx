import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, TeslaInput, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function CalendarScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const events = usePlannerStore((s) => s.events);
  const addEvent = usePlannerStore((s) => s.addEvent);
  const [title, setTitle] = useState('');
  return (
    <ScreenShell title="Calendar" subtitle="Live event list with creation and detail navigation.">
      <Panel>
        <SectionTitle title="Week view" />
        {events.map((event) => (
          <Pressable key={event.id} onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}>
            <Text style={uiStyles.itemTitle}>{event.title}</Text>
            <Text style={uiStyles.itemMeta}>{event.startAt} - {event.endAt} • {event.source}</Text>
          </Pressable>
        ))}
      </Panel>
      <Panel>
        <SectionTitle title="Add event" />
        <TeslaInput value={title} onChangeText={setTitle} placeholder="Event title" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TeslaButton
            label="Add 3 PM Block"
            onPress={() => {
              if (title.trim()) {
                addEvent(title.trim(), '15:00', '16:00');
                setTitle('');
              }
            }}
          />
          <TeslaButton label="Schedule tasks" variant="secondary" onPress={() => addEvent('AI task block', '16:00', '17:00')} />
        </View>
      </Panel>
    </ScreenShell>
  );
}
