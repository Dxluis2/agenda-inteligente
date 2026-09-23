import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getAuth, signOut } from 'firebase/auth';

import { CourseService } from '../../services/course/CourseService';
import { auth } from '../../services/firebase/firebaseConfig';
import { Course } from '../../types';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../theme';

export default function TeacherHomeScreen({
  navigation,
}: any) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const currentUser = getAuth().currentUser;

  const teacherName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Profesor';

  const loadCourses = async () => {
    try {
      setLoading(true);

      const user = getAuth().currentUser;

      if (!user) {
        Alert.alert('Error', 'No hay una sesión activa.');
        return;
      }

      const data = await CourseService.getCoursesByTeacher(
        user.uid
      );

      data.sort((a, b) =>
        a.subjectName.localeCompare(b.subjectName)
      );

      setCourses(data);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message ||
          'No se pudieron cargar los cursos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'focus',
      loadCourses
    );

    return unsubscribe;
  }, [navigation]);

  const totalStudents = useMemo(
    () =>
      courses.reduce(
        (total, course) =>
          total + Number(course.students || 0),
        0
      ),
    [courses]
  );

  const cerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('RoleSelection');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message ||
                  'No se pudo cerrar la sesión.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadCourses}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.welcome}>
                  Bienvenido
                </Text>

                <Text style={styles.teacherName}>
                  {teacherName}
                </Text>

                <Text style={styles.headerSubtitle}>
                  Administra tus cursos, alumnos y recordatorios.
                </Text>
              </View>

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👨‍🏫</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Resumen
            </Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Text style={styles.summaryEmoji}>📚</Text>
                </View>

                <Text style={styles.summaryNumber}>
                  {courses.length}
                </Text>

                <Text style={styles.summaryLabel}>
                  Cursos
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Text style={styles.summaryEmoji}>👨‍🎓</Text>
                </View>

                <Text style={styles.summaryNumber}>
                  {totalStudents}
                </Text>

                <Text style={styles.summaryLabel}>
                  Alumnos
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Mis cursos
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📘</Text>

            <Text style={styles.emptyTitle}>
              {loading
                ? 'Cargando cursos...'
                : 'No tienes cursos asignados'}
            </Text>

            {!loading ? (
              <Text style={styles.emptyText}>
                Cuando el administrador te asigne un curso,
                aparecerá en esta sección.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.courseCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                'TeacherCourseDetail',
                {
                  course: item,
                }
              )
            }
          >
            <View style={styles.courseHeader}>
              <View style={styles.courseIcon}>
                <Text style={styles.courseEmoji}>📘</Text>
              </View>

              <View style={styles.courseInformation}>
                <Text style={styles.subjectName}>
                  {item.subjectName}
                </Text>

                <Text style={styles.courseCode}>
                  Grupo {item.group}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </View>

            <View style={styles.courseDetails}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>
                  Turno
                </Text>

                <Text style={styles.detailValue}>
                  {item.shift === 'MATUTINO'
                    ? 'Matutino'
                    : 'Vespertino'}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>
                  Alumnos
                </Text>

                <Text style={styles.detailValue}>
                  {item.students || 0}
                </Text>
              </View>
            </View>

            <View style={styles.enterContainer}>
              <Text style={styles.enterText}>
                Administrar curso
              </Text>

              <Text style={styles.enterArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.85}
            onPress={cerrarSesion}
          >
            <View style={styles.logoutIcon}>
              <Text style={styles.logoutEmoji}>↪</Text>
            </View>

            <View style={styles.logoutInformation}>
              <Text style={styles.logoutTitle}>
                Cerrar sesión
              </Text>

              <Text style={styles.logoutSubtitle}>
                Salir de la cuenta del profesor
              </Text>
            </View>

            <Text style={styles.logoutArrow}>›</Text>
          </TouchableOpacity>
        }
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
    paddingTop: 60,
    paddingBottom: 50,
  },

  header: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },

  headerText: {
    flex: 1,
    paddingRight: 16,
  },

  welcome: {
    color: '#DBEAFE',
    fontSize: Typography.small,
    fontWeight: '700',
  },

  teacherName: {
    color: Colors.white,
    fontSize: Typography.h1,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'capitalize',
  },

  headerSubtitle: {
    color: '#DBEAFE',
    marginTop: 8,
    lineHeight: 20,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 30,
  },

  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.h3,
    fontWeight: '900',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  summaryEmoji: {
    fontSize: 21,
  },

  summaryNumber: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },

  summaryLabel: {
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '700',
  },

  courseCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },

  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  courseIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  courseEmoji: {
    fontSize: 25,
  },

  courseInformation: {
    flex: 1,
  },

  subjectName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '900',
  },

  courseCode: {
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '700',
  },

  arrow: {
    color: Colors.primary,
    fontSize: 34,
    fontWeight: '700',
  },

  courseDetails: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
  },

  detailBox: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 12,
  },

  detailLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontWeight: '700',
  },

  detailValue: {
    color: Colors.text,
    fontWeight: '900',
    marginTop: 4,
  },

  enterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  enterText: {
    color: Colors.primary,
    fontWeight: '900',
  },

  enterArrow: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 7,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 55,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 44,
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 12,
  },

  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },

  logoutButton: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoutIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  logoutEmoji: {
    color: Colors.danger,
    fontSize: 25,
    fontWeight: '900',
  },

  logoutInformation: {
    flex: 1,
  },

  logoutTitle: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: '900',
  },

  logoutSubtitle: {
    color: '#9F1239',
    marginTop: 3,
    fontSize: Typography.caption,
  },

  logoutArrow: {
    color: Colors.danger,
    fontSize: 30,
    fontWeight: '700',
  },
});