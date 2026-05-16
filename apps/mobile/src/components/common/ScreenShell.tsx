import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export function ScreenShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, backgroundColor: '#0b1020', flexGrow: 1 },
  hero: { gap: 8, paddingTop: 12 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#a7b0c5', fontSize: 14, lineHeight: 20 }
});
