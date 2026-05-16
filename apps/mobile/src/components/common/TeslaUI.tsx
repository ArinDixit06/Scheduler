import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { palette } from '../../constants/theme';

export function Panel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={styles.link}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function TeslaButton({
  label,
  variant = 'primary',
  onPress
}: {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.button, variant === 'primary' ? styles.primaryButton : styles.secondaryButton]}>
      <Text style={[styles.buttonText, variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

export function TeslaInput({
  value,
  onChangeText,
  placeholder
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={palette.silver}
      style={styles.input}
    />
  );
}

export const uiStyles = StyleSheet.create({
  body: { color: palette.graphite, fontSize: 14, lineHeight: 20 },
  itemTitle: { color: palette.navy, fontSize: 16, fontWeight: '600' },
  itemMeta: { color: palette.pewter, fontSize: 13, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 999
  },
  chipText: { color: palette.graphite, fontSize: 12 }
});

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.white,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#EEF1F6',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: palette.navy
  },
  link: {
    color: palette.blue,
    fontSize: 14,
    fontWeight: '500'
  },
  button: {
    minHeight: 46,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  primaryButton: {
    backgroundColor: palette.blue,
    borderColor: palette.blue
  },
  secondaryButton: {
    backgroundColor: palette.white,
    borderColor: palette.line
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  primaryButtonText: {
    color: palette.white
  },
  secondaryButtonText: {
    color: palette.graphite
  },
  input: {
    minHeight: 46,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: palette.dark,
    backgroundColor: palette.mist
  }
});
