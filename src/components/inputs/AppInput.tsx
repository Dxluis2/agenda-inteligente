import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Text,
} from 'react-native';

import {
  Colors,
  Radius,
  Typography,
  Spacing,
} from '../../theme';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function AppInput({
  label,
  error,
  style,
  ...props
}: AppInputProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={Colors.textSecondary}
        {...props}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },

  label: {
    fontSize: Typography.small,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  input: {
    height: 56,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.body,
    color: Colors.text,
  },

  inputError: {
    borderColor: Colors.danger,
  },

  error: {
    marginTop: Spacing.xs,
    color: Colors.danger,
    fontSize: Typography.caption,
    fontWeight: '600',
  },
});