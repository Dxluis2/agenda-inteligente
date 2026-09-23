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

import {
  Task,
  TaskService,
} from '../../../services/task/TaskService';
import { TaskProgressService } from '../../../services/task/TaskProgressService';

import {
  Colors,
  Spacing,
  Typography,
} from '../../../theme';

export default function EditTaskScreen({
  navigation,
  route,
}: any) {
  const { task } = route.params as {
    task: Task;
  };

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(
    task.description || ''
  );
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [dueTime, setDueTime] = useState(task.dueTime);
  const [loading, setLoading] = useState(false);

  const saveChanges = async () => {
    if (!title.trim() || !dueDate.trim() || !dueTime.trim()) {
      Alert.alert(
        'Campos incompletos',
        'Completa título, fecha y hora.'
      );
      return;
    }

    try {
      setLoading(true);

      await TaskService.updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate.trim(),
        dueTime: dueTime.trim(),
      });
      await TaskService.updateTask(task.id, {
  title: title.trim(),
  description: description.trim(),
  dueDate: dueDate.trim(),
  dueTime: dueTime.trim(),
});
await TaskProgressService.updateTaskInformation(
  task.id,
  {
    title,
    description,
    dueDate,
    dueTime,
  }
);
await TaskProgressService.updateTaskInformation(
  task.id,
  {
    title: title.trim(),
    description: description.trim(),
    dueDate: dueDate.trim(),
    dueTime: dueTime.trim(),
  }
);

      Alert.alert(
        'Recordatorio actualizado',
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
        error.message ||
          'No se pudo actualizar el recordatorio.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Editar recordatorio
      </Text>

      <AppInput
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="Título del recordatorio"
      />

      <AppInput
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción"
        multiline
        numberOfLines={4}
        style={styles.descriptionInput}
      />

      <AppInput
        label="Fecha límite"
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="2026-07-20"
      />

      <AppInput
        label="Hora límite"
        value={dueTime}
        onChangeText={setDueTime}
        placeholder="18:00"
      />

      <PrimaryButton
        title="Guardar cambios"
        onPress={saveChanges}
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