import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
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

export default function EditCareerScreen({
  navigation,
  route,
}: any) {
  const { career } = route.params;

  const [nombre, setNombre] = useState(career.nombre);
  const [descripcion, setDescripcion] = useState(
    career.descripcion || ''
  );
  const [loading, setLoading] = useState(false);

  const guardarCambios = async () => {
    if (!nombre.trim()) {
      Alert.alert(
        'Campo obligatorio',
        'Ingresa el nombre de la carrera.'
      );
      return;
    }

    try {
      setLoading(true);

      await CareerService.updateCareer(career.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
      });

      Alert.alert(
        'Carrera actualizada',
        'Los cambios fueron guardados correctamente.',
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
        error.message || 'No se pudo actualizar la carrera.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar carrera</Text>

      <AppInput
        label="Nombre de la carrera"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej. Programación"
      />

      <AppInput
        label="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Descripción de la carrera"
        multiline
        numberOfLines={4}
        style={styles.descriptionInput}
      />

      <PrimaryButton
        title="Guardar cambios"
        onPress={guardarCambios}
        loading={loading}
      />

      <SecondaryButton
        title="Cancelar"
        onPress={() => navigation.goBack()}
      />
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
    marginBottom: 24,
  },

  descriptionInput: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
});