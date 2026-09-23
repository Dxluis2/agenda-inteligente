import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppInput from '../../../components/inputs/AppInput';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';

import { CareerService } from '../../../services/career/CareerService';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../theme';

export default function CreateCareerScreen({
  navigation,
}: any) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const guardarCarrera = async () => {
    if (!nombre.trim()) {
      Alert.alert(
        'Campo obligatorio',
        'Ingresa el nombre de la carrera.'
      );
      return;
    }

    try {
      setLoading(true);

      await CareerService.createCareer({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
      });

      Alert.alert(
        'Carrera creada',
        `La carrera ${nombre.trim()} fue registrada correctamente.`,
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo crear la carrera.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear carrera</Text>

      <Text style={styles.subtitle}>
        Registra una carrera para después agregar sus asignaturas.
      </Text>

      <AppInput
        label="Nombre de la carrera"
        placeholder="Ej. Programación"
        value={nombre}
        onChangeText={setNombre}
      />

      <AppInput
        label="Descripción"
        placeholder="Ej. Carrera enfocada al desarrollo de software"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
        style={styles.descriptionInput}
      />

      <View style={styles.actions}>
        <PrimaryButton
          title="Guardar carrera"
          onPress={guardarCarrera}
          loading={loading}
        />

        <SecondaryButton
          title="Volver"
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    paddingTop: 60,
  },

  title: {
    fontSize: Typography.h1,
    fontWeight: '900',
    color: Colors.text,
  },

  subtitle: {
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: Spacing.lg,
  },

  descriptionInput: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingTop: 16,
  },

  actions: {
    gap: 12,
  },
});