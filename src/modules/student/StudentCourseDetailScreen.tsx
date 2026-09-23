import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth } from '../../services/firebase/firebaseConfig';

import { NotificationService } from '../../services/notifications/NotificationService';


import {
  StudentTaskProgress,
  TaskProgressService,
} from '../../services/task/TaskProgressService';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../theme';

export default function StudentCourseDetailScreen({
  navigation,
  route,
}: any) {
  const course = route.params?.course;

  const [reminders, setReminders] =
    useState<StudentTaskProgress[]>([]);

  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<
    'TODAS' | 'PENDIENTES' | 'COMPLETADAS' | 'VENCIDAS'
  >('TODAS');
  
  const createReminderDate = (
  dueDate: string,
  dueTime: string
): Date | null => {
  if (!dueDate) {
    return null;
  }

  const normalizedTime =
    dueTime?.trim() || '23:59';

  const date = new Date(
    `${dueDate}T${normalizedTime}:00`
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const syncNotifications = async (
  items: StudentTaskProgress[]
) => {
  try {
    for (const item of items) {
      if (item.completed) {
        await NotificationService
          .cancelNotificationsByReminderId(
            item.id
          );

        continue;
      }

      const reminderDate = createReminderDate(
        item.dueDate,
        item.dueTime
      );

      if (
        !reminderDate ||
        reminderDate.getTime() <= Date.now()
      ) {
        await NotificationService
          .cancelNotificationsByReminderId(
            item.id
          );

        continue;
      }

      await NotificationService
        .syncReminderNotifications({
          reminderId: item.id,
          title: item.title,
          subject:
            item.subjectName ||
            item.courseName ||
            course?.subjectName ||
            'Asignatura',
          description: item.description,
          dueDate: reminderDate,
        });
    }
  } catch (error) {
    console.error(
      'Error sincronizando recordatorios:',
      error
    );
  }
};

  const loadReminders = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user || !course?.id) {
        return;
      }

      const data =
        await TaskProgressService.getStudentTasks(
          user.uid
        );

      const filteredByCourse = data
        .filter(
          (item) => item.courseId === course.id
        )
        .sort((a, b) => {
          const dateA = `${a.dueDate || ''} ${
            a.dueTime || ''
          }`;

          const dateB = `${b.dueDate || ''} ${
            b.dueTime || ''
          }`;

          return dateA.localeCompare(dateB);
        });

      setReminders(filteredByCourse);
      await syncNotifications(filteredByCourse);
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
      loadReminders
    );

    return unsubscribe;
  }, [navigation, course?.id]);

  const isExpired = (
    item: StudentTaskProgress
  ) => {
    if (item.completed || !item.dueDate) {
      return false;
    }

    const dueDate = new Date(
      `${item.dueDate}T${
        item.dueTime || '23:59'
      }:00`
    );

    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    return dueDate.getTime() < Date.now();
  };

  const pendingCount = useMemo(
    () =>
      reminders.filter(
        (item) =>
          !item.completed &&
          !isExpired(item)
      ).length,
    [reminders]
  );

  const completedCount = useMemo(
    () =>
      reminders.filter(
        (item) => item.completed
      ).length,
    [reminders]
  );

  const expiredCount = useMemo(
    () =>
      reminders.filter((item) =>
        isExpired(item)
      ).length,
    [reminders]
  );

  const percentage =
    reminders.length === 0
      ? 0
      : Math.round(
          (completedCount / reminders.length) *
            100
        );

  const visibleReminders = useMemo(() => {
    if (filter === 'PENDIENTES') {
      return reminders.filter(
        (item) =>
          !item.completed &&
          !isExpired(item)
      );
    }

    if (filter === 'COMPLETADAS') {
      return reminders.filter(
        (item) => item.completed
      );
    }

    if (filter === 'VENCIDAS') {
      return reminders.filter((item) =>
        isExpired(item)
      );
    }

    return reminders;
  }, [filter, reminders]);

  const completeReminder = (
    item: StudentTaskProgress
  ) => {
    Alert.alert(
      'Completar recordatorio',
      `¿Confirmas que completaste "${item.title}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Completar',
          onPress: async () => {
            try {
              await TaskProgressService.completeTask(
                item.id
              );
              await NotificationService
  .cancelNotificationsByReminderId(
    item.id
  );

              Alert.alert(
                'Recordatorio completado',
                'El profesor podrá ver tu progreso.'
              );

              await loadReminders();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message ||
                  'No se pudo completar el recordatorio.'
              );
            }
          },
        },
      ]
    );
  };

  if (!course) {
    return (
      <View style={styles.container}>

        <Text style={styles.emptyText}>
          No se recibió la información del curso.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleReminders}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadReminders}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.headerCard}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                  navigation.goBack()
                }
              >
                <Text style={styles.backText}>
                  ‹
                </Text>
              </TouchableOpacity>

              <View style={styles.headerInformation}>
                <Text style={styles.headerLabel}>
                  Mi curso
                </Text>

                <Text
                  style={styles.courseTitle}
                  numberOfLines={2}
                >
                  {course.subjectName}
                </Text>

                <Text style={styles.courseMeta}>
                  Grupo {course.group} ·{' '}
                  {course.shift === 'MATUTINO'
                    ? 'Matutino'
                    : 'Vespertino'}
                </Text>
              </View>

              <View style={styles.courseIcon}>
                <Text style={styles.courseEmoji}>
                  📘
                </Text>
              </View>
            </View>

            <View style={styles.teacherCard}>
              <View style={styles.teacherAvatar}>
                <Text style={styles.teacherAvatarText}>
                  {(course.teacherName || 'P')
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.teacherInformation}>
                <Text style={styles.teacherLabel}>
                  Profesor
                </Text>

                <Text style={styles.teacherName}>
                  {course.teacherName ||
                    'Sin profesor asignado'}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Resumen
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.pendingCard}>
                <Text style={styles.summaryNumber}>
                  {pendingCount}
                </Text>

                <Text style={styles.summaryLabel}>
                  Pendientes
                </Text>
              </View>

              <View style={styles.completedCard}>
                <Text style={styles.summaryNumber}>
                  {completedCount}
                </Text>

                <Text style={styles.summaryLabel}>
                  Completadas
                </Text>
              </View>

              <View style={styles.expiredCard}>
                <Text style={styles.summaryNumber}>
                  {expiredCount}
                </Text>

                <Text style={styles.summaryLabel}>
                  Vencidas
                </Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>
                  Progreso del curso
                </Text>

                <Text
                  style={
                    styles.progressPercentage
                  }
                >
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

              <Text style={styles.progressMessage}>
                {percentage === 100
                  ? '🎉 Completaste todos los recordatorios.'
                  : percentage >= 70
                    ? '👏 Vas muy bien.'
                    : percentage >= 40
                      ? '💪 Continúa avanzando.'
                      : '📚 Revisa tus recordatorios pendientes.'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              Recordatorios
            </Text>

            <View style={styles.filters}>
              {[
                {
                  key: 'TODAS',
                  label: `Todas (${reminders.length})`,
                },
                {
                  key: 'PENDIENTES',
                  label: `Pendientes (${pendingCount})`,
                },
                {
                  key: 'COMPLETADAS',
                  label: `Completadas (${completedCount})`,
                },
                {
                  key: 'VENCIDAS',
                  label: `Vencidas (${expiredCount})`,
                },
              ].map((item) => {
                const selected =
                  filter === item.key;

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.filterButton,
                      selected &&
                        styles.filterButtonSelected,
                    ]}
                    onPress={() =>
                      setFilter(item.key as any)
                    }
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selected &&
                          styles.filterTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>
                🗓️
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              {loading
                ? 'Cargando recordatorios...'
                : 'No hay recordatorios en esta sección'}
            </Text>

            {!loading ? (
              <Text style={styles.emptyText}>
                Los recordatorios del profesor
                aparecerán automáticamente aquí.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const expired = isExpired(item);

          return (
            <View style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View
                  style={[
                    styles.reminderIcon,
                    item.completed
                      ? styles.completedIcon
                      : expired
                        ? styles.expiredIcon
                        : styles.pendingIcon,
                  ]}
                >
                  <Text
                    style={
                      styles.reminderIconText
                    }
                  >
                    {item.completed
                      ? '✓'
                      : expired
                        ? '!'
                        : '•'}
                  </Text>
                </View>

                <View
                  style={
                    styles.reminderInformation
                  }
                >
                  <Text
                    style={styles.reminderTitle}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      item.completed
                        ? styles.completedBadge
                        : expired
                          ? styles.expiredBadge
                          : styles.pendingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.completed
                          ? styles.completedText
                          : expired
                            ? styles.expiredText
                            : styles.pendingText,
                      ]}
                    >
                      {item.completed
                        ? 'Completada'
                        : expired
                          ? 'Vencida'
                          : 'Pendiente'}
                    </Text>
                  </View>
                </View>
              </View>

              {item.description ? (
                <Text
                  style={styles.description}
                >
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.dateRow}>
                <View style={styles.dateItem}>
                  <Text style={styles.dateIcon}>
                    📅
                  </Text>

                  <View>
                    <Text style={styles.dateLabel}>
                      Fecha
                    </Text>

                    <Text style={styles.dateValue}>
                      {item.dueDate ||
                        'Sin fecha'}
                    </Text>
                  </View>
                </View>

                <View style={styles.dateItem}>
                  <Text style={styles.dateIcon}>
                    🕒
                  </Text>

                  <View>
                    <Text style={styles.dateLabel}>
                      Hora
                    </Text>

                    <Text style={styles.dateValue}>
                      {item.dueTime ||
                        'Sin hora'}
                    </Text>
                  </View>
                </View>
              </View>

              {!item.completed && !expired ? (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() =>
                    completeReminder(item)
                  }
                  activeOpacity={0.85}
                >
                  <Text
                    style={
                      styles.completeButtonText
                    }
                  >
                    Marcar como completada
                  </Text>
                </TouchableOpacity>
              ) : null}

              {item.completedAt ? (
                <View
                  style={
                    styles.completedDateContainer
                  }
                >
                  <Text
                    style={
                      styles.completedDateText
                    }
                  >
                    Completada el{' '}
                    {new Date(
                      item.completedAt
                    ).toLocaleString()}
                  </Text>
                </View>
              ) : null}
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
  },

  list: {
    padding: Spacing.lg,
    paddingTop: 58,
    paddingBottom: 50,
  },

  headerCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: '500',
    marginTop: -5,
  },

  headerInformation: {
    flex: 1,
  },

  headerLabel: {
    color: '#DBEAFE',
    fontSize: Typography.caption,
    fontWeight: '700',
  },

  courseTitle: {
    color: Colors.white,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 3,
  },

  courseMeta: {
    color: '#DBEAFE',
    marginTop: 7,
    fontWeight: '700',
  },

  courseIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  courseEmoji: {
    fontSize: 27,
  },

  teacherCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  teacherAvatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  teacherAvatarText: {
    color: '#7C3AED',
    fontSize: 18,
    fontWeight: '900',
  },

  teacherInformation: {
    flex: 1,
  },

  teacherLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontWeight: '700',
  },

  teacherName: {
    color: Colors.text,
    fontWeight: '900',
    marginTop: 3,
  },

  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.h3,
    fontWeight: '900',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },

  pendingCard: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },

  completedCard: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },

  expiredCard: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },

  summaryNumber: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '900',
  },

  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontWeight: '800',
    marginTop: 4,
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
    height: 11,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
  },

  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },

  progressMessage: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '700',
  },

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },

  filterButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  filterButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  filterText: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontWeight: '800',
  },

  filterTextSelected: {
    color: Colors.white,
  },

  reminderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },

  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  reminderIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  pendingIcon: {
    backgroundColor: '#FEF3C7',
  },

  completedIcon: {
    backgroundColor: '#DCFCE7',
  },

  expiredIcon: {
    backgroundColor: '#FEE2E2',
  },

  reminderIconText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
  },

  reminderInformation: {
    flex: 1,
  },

  reminderTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '900',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 7,
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  completedBadge: {
    backgroundColor: '#DCFCE7',
  },

  expiredBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: Typography.caption,
    fontWeight: '900',
  },

  pendingText: {
    color: Colors.warning,
  },

  completedText: {
    color: Colors.success,
  },

  expiredText: {
    color: Colors.danger,
  },

  description: {
    color: Colors.textSecondary,
    marginTop: 13,
    lineHeight: 21,
  },

  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
  },

  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 11,
  },

  dateIcon: {
    fontSize: 20,
    marginRight: 9,
  },

  dateLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontWeight: '700',
  },

  dateValue: {
    color: Colors.text,
    fontWeight: '900',
    marginTop: 3,
  },

  completeButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 13,
    marginTop: Spacing.md,
  },

  completeButtonText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '900',
  },

  completedDateContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: Radius.md,
    padding: 10,
    marginTop: Spacing.md,
  },

  completedDateText: {
    color: Colors.success,
    textAlign: 'center',
    fontSize: Typography.caption,
    fontWeight: '800',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 55,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyEmoji: {
    fontSize: 34,
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 16,
  },

  emptyText: {
    color: Colors.textSecondary,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
});