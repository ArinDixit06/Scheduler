import { View, Text } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function IntegrationsScreen() {
  const integrations = usePlannerStore((s) => s.integrations);
  const toggleIntegration = usePlannerStore((s) => s.toggleIntegration);

  return (
    <ScreenShell title="Integrations" subtitle="Each provider can now connect or disconnect locally.">
      <Panel>
        <SectionTitle title="Providers" />
        {integrations.map((integration) => (
          <View key={integration.id} style={{ gap: 6 }}>
            <Text style={uiStyles.itemTitle}>{integration.name}</Text>
            <Text style={uiStyles.itemMeta}>{integration.scope} • last synced {integration.lastSyncedAt}</Text>
            <TeslaButton label={integration.connected ? 'Disconnect' : 'Connect'} onPress={() => toggleIntegration(integration.id)} />
          </View>
        ))}
      </Panel>
    </ScreenShell>
  );
}
