import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Radius,
  Typography,
} from '../../theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
}

export default function SecondaryButton({
  title,
  onPress,
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderColor: Colors.primary,

    height: 56,

    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: Radius.lg,
  },

  text: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: Typography.body,
  },
});
