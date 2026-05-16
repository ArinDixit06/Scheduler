import { useState } from 'react';
import { Text } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { Panel, SectionTitle, TeslaButton, TeslaInput, uiStyles } from '../../components/common/TeslaUI';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <ScreenShell title="Forgot Password" subtitle="Local reset-request flow for the mobile shell.">
      <Panel>
        <SectionTitle title="Reset access" />
        <TeslaInput value={email} onChangeText={setEmail} placeholder="Email" />
        <TeslaButton label="Send Reset Link" onPress={() => setSubmitted(Boolean(email.trim()))} />
        {submitted ? <Text style={uiStyles.itemMeta}>Reset request queued for {email}.</Text> : null}
      </Panel>
    </ScreenShell>
  );
}
