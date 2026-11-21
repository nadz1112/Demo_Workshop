import { useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { priorityLabels, validateTaskFields } from '../domain/tasks';
import type { TaskFieldErrors, TaskInput } from '../types/task';
import { Control } from './Control';
import { colors, ui } from './theme';

type Props = {
  initialValue: TaskInput;
  mode: 'create' | 'edit';
  onSave: (input: TaskInput) => Promise<boolean>;
  onCancel: () => void;
  disabled: boolean;
};

const textFields = [
  { key: 'title', label: 'Tiêu đề', placeholder: 'Ví dụ: Viết báo cáo' },
  { key: 'description', label: 'Mô tả (không bắt buộc)', placeholder: 'Thêm ghi chú' },
  { key: 'dueDate', label: 'Ngày đến hạn (không bắt buộc)', placeholder: 'YYYY-MM-DD' },
] as const;

export function TaskForm({ initialValue, mode, onSave, onCancel, disabled }: Props) {
  const [input, setInput] = useState(initialValue);
  const [errors, setErrors] = useState<TaskFieldErrors>({});
  const [focus, setFocus] = useState<keyof TaskInput>();

  function update<Field extends keyof TaskInput>(field: Field, value: TaskInput[Field]) {
    setInput(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  }

  async function submit() {
    const result = validateTaskFields(input);
    setErrors(result.errors);
    const messages = Object.values(result.errors);
    if (messages.length > 0) {
      if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(messages.join(' '));
      return;
    }
    if (await onSave(input)) {
      setInput(initialValue);
      setErrors({});
    }
  }

  return (
    <View style={ui.panel}>
      <Text accessibilityRole="header" style={ui.heading}>
        {mode === 'edit' ? 'Sửa công việc' : 'Thêm công việc'}
      </Text>
      {textFields.map(({ key, label, placeholder }) => (
        <View key={key} style={styles.field}>
          <Text style={ui.text}>{label}</Text>
          <TextInput
            accessibilityLabel={label}
            accessibilityHint={errors[key]}
            aria-describedby={Platform.OS === 'web' && errors[key] ? `error-${key}` : undefined}
            editable={!disabled}
            value={input[key]}
            onChangeText={value => update(key, value)}
            onFocus={() => setFocus(key)}
            onBlur={() => setFocus(undefined)}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            multiline={key === 'description'}
            style={[styles.input, key === 'description' && styles.multiline,
              errors[key] && styles.invalid, focus === key && styles.focused]}
          />
          {errors[key] && <Text nativeID={`error-${key}`} accessibilityLiveRegion="polite" style={ui.error}>{errors[key]}</Text>}
        </View>
      ))}
      <Text style={ui.text}>Ưu tiên</Text>
      <View style={ui.row}>
        {(Object.keys(priorityLabels) as (keyof typeof priorityLabels)[]).map(priority => (
          <Control key={priority} label={priorityLabels[priority]} disabled={disabled}
            selected={input.priority === priority} onPress={() => update('priority', priority)} />
        ))}
      </View>
      {errors.priority && <Text accessibilityRole="alert" style={ui.error}>{errors.priority}</Text>}
      <View style={ui.row}>
        <Control label={mode === 'edit' ? 'Lưu thay đổi' : 'Tạo công việc'} tone="primary"
          disabled={disabled} onPress={() => void submit()} />
        {mode === 'edit' && <Control label="Hủy sửa" disabled={disabled} onPress={onCancel} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 5 },
  input: { borderColor: colors.border, borderWidth: 2, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, minHeight: 44, fontSize: 16, color: colors.ink },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  invalid: { borderColor: colors.danger },
  focused: { borderColor: '#3468b9' },
});
