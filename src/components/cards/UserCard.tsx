import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Radius,
  Shadows,
  Typography,
  Spacing,
} from '../../theme';

interface UserCardProps {
  nombre: string;
  correo: string;
  role: string;
  estado: string;
  matricula?: string;

  onEdit?: () => void;
  onDelete?: () => void;
}

export default function UserCard({
  nombre,
  correo,
  role,
  estado,
  matricula,
  onEdit,
  onDelete,
}: UserCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {nombre.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {nombre}
          </Text>

          <Text style={styles.email}>
            {correo}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.label}>
          Rol: {role}
        </Text>

        {matricula ? (
          <Text style={styles.label}>
            Matrícula: {matricula}
          </Text>
        ) : null}

        <Text
          style={[
            styles.status,
            estado === 'Activo'
              ? styles.active
              : styles.inactive,
          ]}
        >
          {estado}
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.edit}
          onPress={onEdit}
        >
          <Text style={styles.editText}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.delete}
          onPress={onDelete}
        >
          <Text style={styles.deleteText}>
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,

    ...Shadows.card,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 15,
  },

  avatarText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 20,
  },

  name: {
    fontSize: Typography.body,
    fontWeight: '800',
    color: Colors.text,
  },

  email: {
    color: Colors.textSecondary,
    marginTop: 3,
  },

  info: {
    marginTop: 15,
  },

  label: {
    color: Colors.text,
    marginBottom: 5,
  },

  status: {
    marginTop: 8,
    fontWeight: '700',
  },

  active: {
    color: Colors.success,
  },

  inactive: {
    color: Colors.danger,
  },

  buttons: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
  },

  edit: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: Radius.md,
  },

  delete: {
    flex: 1,
    backgroundColor: Colors.danger,
    padding: 12,
    borderRadius: Radius.md,
  },

  editText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '700',
  },

  deleteText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '700',
  },
});