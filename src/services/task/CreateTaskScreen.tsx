import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import AppInput from '../../components/inputs/AppInput';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';

import { TaskService } from './TaskService';

import {
  Colors,
  Spacing,
  Typography,
} from '../../theme';

export default function CreateTaskScreen({
  navigation,
  route,
}: any) {
  const { course } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [loading, setLoading] = useState(false);

  const saveTask = async () => {
    if (!title.trim() || !dueDate.trim() || !dueTime.trim()) {
      Alert.alert(
        'Campos incompletos',
        'Completa título, fecha y hora.'
      );

      return;
    }

    try {
      setLoading(true);

      await TaskService.createTask({
        courseId: course.id,
        courseName: course.subjectName,
        subjectName: course.subjectName,
        group: course.group,

        teacherId: course.teacherId,
        teacherName: course.teacherName,

        title: title.trim(),
        description: description.trim(),

        dueDate: dueDate.trim(),
        dueTime: dueTime.trim(),
      });

      Alert.alert(
        'Recordatorio creado',
        'El recordatorio se guardó correctamente.',
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
        error.message || 'No se pudo crear el recordatorio.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear recordatorio</Text>

      <Text style={styles.subtitle}>
        {course.subjectName} · Grupo {course.group}
      </Text>

      <AppInput
        label="Título"
        placeholder="Ej. Investigar Firebase"
        value={title}
        onChangeText={setTitle}
      />

      <AppInput
        label="Descripción"
        placeholder="Indicaciones del recordatorio"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.descriptionInput}
      />

      <AppInput
        label="Fecha límite"
        placeholder="Ej. 2026-07-20"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <AppInput
        label="Hora límite"
        placeholder="Ej. 18:00"
        value={dueTime}
        onChangeText={setDueTime}
      />

      <PrimaryButton
        title="Guardar recordatorio"
        onPress={saveTask}
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
  },

  subtitle: {
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },

  descriptionInput: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
});