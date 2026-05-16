import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette } from '../../constants/theme';

export function ScreenShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>APEX</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 20,
    backgroundColor: palette.ash
  },
  hero: {
    minHeight: 180,
    borderRadius: 12,
    padding: 24,
    justifyContent: 'flex-end',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  eyebrow: {
    color: palette.pewter,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10
  },
  title: {
    color: palette.dark,
    fontSize: 32,
    fontWeight: '500',
    lineHeight: 38
  },
  subtitle: {
    color: palette.graphite,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10
  },
  content: {
    gap: 16
  }
});
