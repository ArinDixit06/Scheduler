import { Button, Text, TextInput, View } from 'react-native';
import { ScreenShell } from '../../components/common/ScreenShell';
import { useAuthStore } from '../../store/authStore';

export function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  return (
    <ScreenShell title="Sign in" subtitle="Enter any value to unlock the demo app.">
      <View style={{ gap: 12 }}>
        <TextInput placeholder="Email" placeholderTextColor="#7c859d" style={inputStyle} />
        <TextInput placeholder="Password" placeholderTextColor="#7c859d" secureTextEntry style={inputStyle} />
        <Button title="Sign In" onPress={() => signIn('demo-token', 'Apex User')} />
      </View>
    </ScreenShell>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#25304a',
  color: '#fff',
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: '#111933'
};
