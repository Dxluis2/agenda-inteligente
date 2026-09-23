import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PrimaryButton from '../../../components/buttons/PrimaryButton';

import {
  Task,
  TaskService,
} from '../../../services/task/TaskService';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../../theme';

export default function TasksListScreen({
  navigation,
  route,
}: any) {
  const course = route.params?.course;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    if (!course?.id) {
      Alert.alert(
        'Error',
        'No se recibió correctamente la información del curso.'
      );
      return;
    }

    try {
      setLoading(true);

      const data = await TaskService.getTasks(course.id);

      const orderedTasks = [...data].sort((a, b) => {
        const dateA = `${a.dueDate || ''} ${a.dueTime || ''}`;
        const dateB = `${b.dueDate || ''} ${b.dueTime || ''}`;

        return dateA.localeCompare(dateB);
      });

      setTasks(orderedTasks);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message ||
          'No se pudieron cargar los recordatorios.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'focus',
      loadTasks
    );

    return unsubscribe;
  }, [navigation, course?.id]);

  const deleteReminder = (task: Task) => {
    Alert.alert(
      'Eliminar recordatorio',
      `¿Seguro que deseas eliminar "${task.title}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await TaskService.deleteTask(task.id);
              await loadTasks();

              Alert.alert(
                'Recordatorio eliminado',
                'El recordatorio fue eliminado correctamente.'
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message ||
                  'No se pudo eliminar el recordatorio.'
              );
            }
          },
        },
      ]
    );
  };

  const isExpired = (task: Task) => {
    if (!task.dueDate) {
      return false;
    }

    const dueDate = new Date(
      `${task.dueDate}T${task.dueTime || '23:59'}:00`
    );

    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    return dueDate.getTime() < Date.now();
  };

  if (!course) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          No se pudo abrir el curso
        </Text>

        <Text style={styles.empty}>
          Falta la información del curso.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Recordatorios
      </Text>

      <Text style={styles.subtitle}>
        {course.subjectName} · Grupo {course.group}
      </Text>

      <PrimaryButton
        title="Crear recordatorio"
        onPress={() =>
          navigation.navigate('CreateTask', {
            course,
          })
        }
      />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadTasks}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? 'Cargando recordatorios...'
              : 'No hay recordatorios registrados.'}
          </Text>
        }
        renderItem={({ item }) => {
          const expired = isExpired(item);

          return (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.taskTitle}>
                  {item.title}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    expired
                      ? styles.expiredBadge
                      : styles.activeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      expired
                        ? styles.expiredText
                        : styles.activeText,
                    ]}
                  >
                    {expired ? 'Vencido' : 'Activo'}
                  </Text>
                </View>
              </View>

              {item.description ? (
                <Text style={styles.description}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.dateContainer}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>
                    Fecha
                  </Text>

                  <Text style={styles.dateValue}>
                    {item.dueDate || 'Sin fecha'}
                  </Text>
                </View>

                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>
                    Hora
                  </Text>

                  <Text style={styles.dateValue}>
                    {item.dueTime || 'Sin hora'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.progressButton}
                onPress={() =>
                  navigation.navigate('TaskProgress', {
                    task: item,
                    course,
                  })
                }
              >
                <Text style={styles.buttonText}>
                  Ver progreso de alumnos
                </Text>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('EditTask', {
                      task: item,
                      course,
                    })
                  }
                >
                  <Text style={styles.buttonText}>
                    Editar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteReminder(item)}
                >
                  <Text style={styles.buttonText}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 6,
    marginBottom: Spacing.lg,
  },

  list: {
    paddingTop: Spacing.lg,
    paddingBottom: 50,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  taskTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '900',
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  expiredBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: Typography.caption,
    fontWeight: '800',
  },

  activeText: {
    color: Colors.success,
  },

  expiredText: {
    color: Colors.danger,
  },

  description: {
    color: Colors.textSecondary,
    lineHeight: 21,
    marginTop: 10,
  },

  dateContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
  },

  dateBox: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 12,
  },

  dateLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontWeight: '700',
  },

  dateValue: {
    color: Colors.text,
    fontWeight: '900',
    marginTop: 4,
  },

  progressButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  editButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 11,
    borderRadius: Radius.md,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: Colors.danger,
    paddingVertical: 11,
    borderRadius: Radius.md,
  },

  buttonText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '800',
  },

  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 70,
    fontWeight: '700',
  },
});