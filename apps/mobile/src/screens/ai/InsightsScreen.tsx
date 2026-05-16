import { Text } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, uiStyles } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function InsightsScreen() {
  const insights = usePlannerStore((s) => s.insights);
  const dismissInsight = usePlannerStore((s) => s.dismissInsight);

  return (
    <ScreenShell title="Insights" subtitle="Dismissible suggestions and pattern cards backed by the planner store.">
      {insights.map((insight) => (
        <Panel key={insight.id}>
          <SectionTitle title={insight.title} />
          <Text style={uiStyles.body}>{insight.body}</Text>
          {!insight.dismissed ? <TeslaButton label="Dismiss" onPress={() => dismissInsight(insight.id)} /> : <Text style={uiStyles.itemMeta}>Dismissed</Text>}
        </Panel>
      ))}
    </ScreenShell>
  );
}
