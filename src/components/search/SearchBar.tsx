import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
  Typography,
} from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },

  input: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 18,
    fontSize: Typography.body,
    color: Colors.text,
  },
});