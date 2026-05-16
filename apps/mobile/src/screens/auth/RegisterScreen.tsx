import { useState } from 'react';
import { Text } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, TeslaInput, uiStyles } from '../../components/common/TeslaUI';
import { useAuthStore } from '../../store/authStore';

export function RegisterScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <ScreenShell title="Register" subtitle="Simple local account bootstrap for the Expo build.">
      <Panel>
        <SectionTitle title="Create profile" />
        <TeslaInput value={name} onChangeText={setName} placeholder="Name" />
        <TeslaInput value={email} onChangeText={setEmail} placeholder="Email" />
        <TeslaButton label="Create Account" onPress={() => signIn('demo-token', name.trim() || email.trim() || 'Apex User')} />
        <Text style={uiStyles.itemMeta}>This screen uses local demo auth only.</Text>
      </Panel>
    </ScreenShell>
  );
}
