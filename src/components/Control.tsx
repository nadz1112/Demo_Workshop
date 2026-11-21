import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from './theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  tone?: 'primary' | 'danger';
};

export function Control({ label, onPress, disabled, selected, tone }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button, selected && styles.selected, tone === 'primary' && styles.primary,
        focused && styles.focused, (pressed || disabled) && styles.dim,
      ]}
    >
      <Text style={[
        styles.label, tone === 'primary' && styles.light,
        tone === 'danger' && styles.danger,
      ]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderWidth: 2, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12,
    paddingVertical: 8, minHeight: 44, justifyContent: 'center' },
  selected: { backgroundColor: colors.soft, borderColor: colors.accent },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  focused: { borderColor: '#3468b9' },
  dim: { opacity: 0.6 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  light: { color: colors.surface },
  danger: { color: colors.danger },
});
