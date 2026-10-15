import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

export function TextField({ label, error, style, inputStyle, multiline, ...inputProps }) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        multiline={multiline}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          multiline ? styles.inputMultiline : null,
          error ? styles.inputError : null,
          inputStyle,
        ]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
