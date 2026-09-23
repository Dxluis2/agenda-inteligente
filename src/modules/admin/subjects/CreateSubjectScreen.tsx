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

import { SubjectService } from '../../../services/subject/SubjectService';

import {
  Colors,
  Spacing,
  Typography,
} from '../../../theme';

export default function CreateSubjectScreen({
  route,
  navigation,
}: any) {
  const { career } = route.params;

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const guardarAsignatura = async () => {
    if (!nombre.trim() || !codigo.trim()) {
      Alert.alert(
        'Campos incompletos',
        'Completa el nombre y el código de la asignatura.'
      );
      return;
    }

    try {
      setLoading(true);

      await SubjectService.createSubject({
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase(),
        descripcion: descripcion.trim(),
        careerId: career.id,
        careerName: career.nombre,
      });

      Alert.alert(
        'Asignatura creada',
        `La asignatura ${nombre.trim()} fue agregada a la carrera ${career.nombre}.`,
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
        error.message || 'No se pudo crear la asignatura.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear asignatura</Text>

      <Text style={styles.subtitle}>
        Carrera: {career.nombre}
      </Text>

      <View style={styles.careerCard}>
        <Text style={styles.careerLabel}>Carrera seleccionada</Text>
        <Text style={styles.careerName}>{career.nombre}</Text>

        {career.descripcion ? (
          <Text style={styles.careerDescription}>
            {career.descripcion}
          </Text>
        ) : null}
      </View>

      <AppInput
        label="Nombre de la asignatura"
        placeholder="Ej. Desarrollo de Aplicaciones"
        value={nombre}
        onChangeText={setNombre}
      />

      <AppInput
        label="Código"
        placeholder="Ej. DA-01"
        autoCapitalize="characters"
        value={codigo}
        onChangeText={setCodigo}
      />

      <AppInput
        label="Descripción"
        placeholder="Descripción breve de la asignatura"
        multiline
        numberOfLines={4}
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.descriptionInput}
      />

      <View style={styles.actions}>
        <PrimaryButton
          title="Guardar asignatura"
          onPress={guardarAsignatura}
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
    marginTop: 8,
    marginBottom: Spacing.lg,
  },

  careerCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 16,
    marginBottom: Spacing.lg,
  },

  careerLabel: {
    color: Colors.primary,
    fontSize: Typography.caption,
    fontWeight: '800',
  },

  careerName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '900',
    marginTop: 4,
  },

  careerDescription: {
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
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