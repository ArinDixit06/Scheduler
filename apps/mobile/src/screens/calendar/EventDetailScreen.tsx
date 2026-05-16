import { useMemo } from 'react';
import { Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function EventDetailScreen() {
  const route = useRoute<RouteProp<Record<string, { eventId?: string }>, string>>();
  const events = usePlannerStore((s) => s.events);
  const event = useMemo(() => events.find((item) => item.id === route.params?.eventId) ?? events[0], [events, route.params?.eventId]);

  if (!event) {
    return <ScreenShell title="Event Detail"><Text>No event found.</Text></ScreenShell>;
  }

  return (
    <ScreenShell title={event.title} subtitle={event.description}>
      <Panel>
        <SectionTitle title="Schedule" />
        <Text style={uiStyles.body}>{event.startAt} - {event.endAt}</Text>
        <Text style={uiStyles.body}>Source: {event.source}</Text>
      </Panel>
      <Panel>
        <SectionTitle title="Linked tasks" />
        {event.linkedTaskIds.length ? event.linkedTaskIds.map((taskId) => <Text key={taskId} style={uiStyles.body}>{taskId}</Text>) : <Text style={uiStyles.body}>No linked tasks.</Text>}
      </Panel>
    </ScreenShell>
  );
}
