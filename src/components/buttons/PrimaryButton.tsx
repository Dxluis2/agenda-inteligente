import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import {
  Colors,
  Radius,
  Typography,
  Shadows,
} from '../../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: Radius.lg,

    justifyContent: 'center',
    alignItems: 'center',

    ...Shadows.card,
  },

  disabled: {
    opacity: 0.6,
  },

  text: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: Typography.body,
  },
});