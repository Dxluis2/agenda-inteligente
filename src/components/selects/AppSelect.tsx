import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../theme';

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
};

export default function AppSelect({
  label,
  value,
  placeholder = 'Seleccionar',
  onPress,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.select}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Text
          style={[
            styles.value,
            !value && styles.placeholder,
          ]}
        >
          {value || placeholder}
        </Text>

        <Text style={styles.arrow}>⌄</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },

  label: {
    color: Colors.text,
    fontSize: Typography.small,
    fontWeight: '700',
    marginBottom: 8,
  },

  select: {
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  value: {
    color: Colors.text,
    fontSize: Typography.body,
    flex: 1,
  },

  placeholder: {
    color: Colors.textSecondary,
  },

  arrow: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});