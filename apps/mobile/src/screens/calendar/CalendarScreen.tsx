import { Text, View } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { events } from '../../data/mockData';

export function CalendarScreen() {
  return (
    <ScreenShell title="Calendar" subtitle="Week view, smart schedule, and day detail placeholder.">
      <View style={section}>{events.map((e) => <Text key={e.id} style={item}>{e.startAt} - {e.endAt} {e.title}</Text>)}</View>
    </ScreenShell>
  );
}

const section = { gap: 8, padding: 16, borderRadius: 18, backgroundColor: '#111933' };
const item = { color: '#d8def0' };
