import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    gap: 20,
    backgroundColor: palette.ash
  },
  hero: {
    minHeight: 164,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'flex-end',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: '#EEF1F6',
    shadowColor: '#101828',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2
  },
  eyebrow: {
    color: palette.pewter,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10
  },
  title: {
    color: palette.navy,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36
  },
  subtitle: {
    color: palette.graphite,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10
  },
  content: {
    gap: 16
  }
});
