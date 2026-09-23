import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  Radius,
  Typography,
  Spacing,
  Shadows,
} from '../../theme';

interface DashboardCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
}: DashboardCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '47%',
    ...Shadows.card,
  },

  value: {
    fontSize: Typography.h2,
    fontWeight: '900',
    color: Colors.primary,
  },

  title: {
    marginTop: Spacing.xs,
    fontSize: Typography.small,
    fontWeight: '700',
    color: Colors.text,
  },

  subtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
});