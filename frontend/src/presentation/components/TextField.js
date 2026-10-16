import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

export function TextField({
  label,
  error,
  style,
  inputStyle,
  multiline,
  secureTextEntry,
  onFocus,
  onBlur,
  ...inputProps
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(Boolean(secureTextEntry));
  const canToggle = Boolean(secureTextEntry);

  function handleFocus(event) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event) {
    setIsFocused(false);
    onBlur?.(event);
  }

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, isFocused ? styles.rowFocused : null, error ? styles.rowError : null]}>
        <TextInput
          multiline={multiline}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholderTextColor={colors.muted}
          secureTextEntry={canToggle ? isHidden : secureTextEntry}
          selectionColor={colors.primary}
          style={[styles.input, multiline ? styles.inputMultiline : null, inputStyle]}
          {...inputProps}
        />
        {canToggle ? (
          <Pressable
            accessibilityLabel={isHidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setIsHidden((value) => !value)}
            style={styles.toggle}
          >
            <Text style={styles.toggleLabel}>{isHidden ? 'Ver' : 'Ocultar'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs + 2,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  rowFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  rowError: {
    borderColor: colors.danger,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 52,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: spacing.sm + 4,
    textAlignVertical: 'top',
  },
  toggle: {
    paddingLeft: spacing.sm,
  },
  toggleLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs + 2,
  },
});
