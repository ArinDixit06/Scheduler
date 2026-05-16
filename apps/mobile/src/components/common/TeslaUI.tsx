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
  itemTitle: { color: palette.dark, fontSize: 16, fontWeight: '500' },
  itemMeta: { color: palette.pewter, fontSize: 13, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 4
  },
  chipText: { color: palette.graphite, fontSize: 12 }
});

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: palette.dark
  },
  link: {
    color: palette.blue,
    fontSize: 14,
    fontWeight: '500'
  },
  button: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
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
    minHeight: 42,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    color: palette.dark,
    backgroundColor: palette.white
  }
});
