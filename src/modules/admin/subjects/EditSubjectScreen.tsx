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

import { SubjectService } from '../../../services/subject/SubjectService';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../theme';

export default function EditSubjectScreen({
  navigation,
  route,
}: any) {
  const { subject } = route.params;

  const [nombre, setNombre] = useState(subject.nombre);
  const [codigo, setCodigo] = useState(subject.codigo);
  const [descripcion, setDescripcion] = useState(
    subject.descripcion || ''
  );
  const [loading, setLoading] = useState(false);

  const guardarCambios = async () => {
    if (!nombre.trim() || !codigo.trim()) {
      Alert.alert(
        'Campos incompletos',
        'Completa nombre y código.'
      );
      return;
    }

    try {
      setLoading(true);

      await SubjectService.updateSubject(subject.id, {
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase(),
        descripcion: descripcion.trim(),
      });

      Alert.alert(
        'Asignatura actualizada',
        'Los cambios fueron guardados.',
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
        error.message || 'No se pudo actualizar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar asignatura</Text>

      <AppInput
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <AppInput
        label="Código"
        value={codigo}
        onChangeText={setCodigo}
        autoCapitalize="characters"
      />

      <AppInput
        label="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
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
});