import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, TeslaInput } from '../../components/common/TeslaUI';
import { usePlannerStore } from '../../store/plannerStore';

export function NewTaskScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const addTask = usePlannerStore((s) => s.addTask);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');

  return (
    <ScreenShell title="New Task" subtitle="Quick capture writes directly into local planner state.">
      <Panel>
        <SectionTitle title="Capture" />
        <TeslaInput value={title} onChangeText={setTitle} placeholder="Title" />
        <TeslaInput value={description} onChangeText={setDescription} placeholder="Description" />
        <TeslaInput value={project} onChangeText={setProject} placeholder="Project" />
        <TeslaButton
          label="Save Task"
          onPress={() => {
            if (!title.trim()) {
              return;
            }
            addTask(title.trim(), description.trim() || 'New quick-capture task.', project.trim() || undefined);
            navigation.goBack();
          }}
        />
      </Panel>
    </ScreenShell>
  );
}
