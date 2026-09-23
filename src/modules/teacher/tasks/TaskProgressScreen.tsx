import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  StudentTaskProgress,
  TaskProgressService,
} from '../../../services/task/TaskProgressService';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../../theme';

export default function TaskProgressScreen({
  navigation,
  route,
}: any) {
  const task = route.params?.task;
  const course = route.params?.course;

  const [students, setStudents] =
    useState<StudentTaskProgress[]>([]);

  const [loading, setLoading] = useState(false);

  const loadProgress = async () => {
    if (!task?.id) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await TaskProgressService.getProgress(task.id);

      data.sort((a, b) =>
        (a.studentName || '').localeCompare(
          b.studentName || ''
        )
      );

      setStudents(data);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message ||
          'No se pudo cargar el progreso.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'focus',
      loadProgress
    );

    return unsubscribe;
  }, [navigation, task?.id]);

  const completedCount = useMemo(
    () =>
      students.filter(
        (student) => student.completed
      ).length,
    [students]
  );

  const pendingCount =
    students.length - completedCount;

  const percentage =
    students.length === 0
      ? 0
      : Math.round(
          (completedCount / students.length) * 100
        );

  if (!task || !course) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          No se pudo abrir el progreso
        </Text>

        <Text style={styles.empty}>
          Faltan los datos del recordatorio o del curso.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Progreso del grupo
      </Text>

      <Text style={styles.subtitle}>
        {task.title}
      </Text>

      <Text style={styles.courseText}>
        {course.subjectName} · Grupo {course.group}
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {students.length}
          </Text>

          <Text style={styles.summaryLabel}>
            Total
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {completedCount}
          </Text>

          <Text style={styles.summaryLabel}>
            Completaron
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {pendingCount}
          </Text>

          <Text style={styles.summaryLabel}>
            Pendientes
          </Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            Avance general
          </Text>

          <Text style={styles.progressPercentage}>
            {percentage}%
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
              },
            ]}
          />
        </View>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadProgress}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? 'Cargando progreso...'
              : 'No hay alumnos asignados a este recordatorio.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.studentName || 'A')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.studentInformation}>
              <Text style={styles.name}>
                {item.studentName || 'Alumno'}
              </Text>

              <Text style={styles.matricula}>
                Matrícula:{' '}
                {item.matricula || 'Sin matrícula'}
              </Text>

              {item.completedAt ? (
                <Text style={styles.completedDate}>
                  Completada:{' '}
                  {new Date(
                    item.completedAt
                  ).toLocaleString()}
                </Text>
              ) : null}
            </View>

            <View
              style={[
                styles.badge,
                item.completed
                  ? styles.completedBadge
                  : styles.pendingBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  item.completed
                    ? styles.completedText
                    : styles.pendingText,
                ]}
              >
                {item.completed
                  ? 'Completada'
                  : 'Pendiente'}
              </Text>
            </View>
          </View>
        )}
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
    color: Colors.text,
    fontSize: Typography.h3,
    fontWeight: '900',
    marginTop: 8,
  },

  courseText: {
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  summaryNumber: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },

  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    marginTop: 4,
    fontWeight: '700',
  },

  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressTitle: {
    color: Colors.text,
    fontWeight: '900',
  },

  progressPercentage: {
    color: Colors.primary,
    fontWeight: '900',
  },

  progressTrack: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    marginTop: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },

  studentInformation: {
    flex: 1,
  },

  name: {
    fontWeight: '900',
    color: Colors.text,
    fontSize: Typography.body,
  },

  matricula: {
    color: Colors.textSecondary,
    marginTop: 4,
  },

  completedDate: {
    color: Colors.success,
    marginTop: 4,
    fontSize: Typography.caption,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 8,
  },

  completedBadge: {
    backgroundColor: '#DCFCE7',
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  badgeText: {
    fontSize: Typography.caption,
    fontWeight: '900',
  },

  completedText: {
    color: Colors.success,
  },

  pendingText: {
    color: Colors.warning,
  },

  empty: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 60,
    fontWeight: '700',
  },
});