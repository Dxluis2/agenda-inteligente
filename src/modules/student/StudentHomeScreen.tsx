import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import {
  auth,
  db,
} from '../../services/firebase/firebaseConfig';

import {
  CourseStudentService,
} from '../../services/courseStudent/CourseStudentService';

import { NotificationService } from '../../services/notifications/NotificationService';

type StudentCourse = {
  id: string;
  subjectName: string;
  group: string;
  teacherName: string;
  shift: 'MATUTINO' | 'VESPERTINO';
  careerName?: string;
};

export default function StudentHomeScreen({
  navigation,
}: any) {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [studentName, setStudentName] = useState('Alumno');
  const [loading, setLoading] = useState(false);
  const [testingNotification, setTestingNotification] =
    useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        Alert.alert(
          'Sesión no disponible',
          'No se encontró una sesión activa.'
        );

        return;
      }

      const userSnapshot = await getDoc(
        doc(db, 'users', user.uid)
      );

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();

        setStudentName(
          userData.nombre ||
            userData.name ||
            'Alumno'
        );
      }

      const data =
        await CourseStudentService.getCoursesByStudent(
          user.uid
        );

      const orderedCourses = [...data].sort(
        (a: any, b: any) =>
          (a.subjectName || '').localeCompare(
            b.subjectName || ''
          )
      );

      setCourses(
        orderedCourses as StudentCourse[]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message ||
          'No se pudieron cargar tus cursos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'focus',
      loadData
    );

    return unsubscribe;
  }, [navigation]);


  const logout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que deseas salir de tu cuenta?',
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

              navigation.replace(
                'RoleSelection'
              );
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
        onRefresh={loadData}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.headerCard}>
              <View style={styles.headerInformation}>
                <Text style={styles.welcome}>
                  Bienvenido
                </Text>

                <Text
                  style={styles.studentName}
                  numberOfLines={2}
                >
                  {studentName}
                </Text>

                <Text style={styles.headerDescription}>
                  Consulta tus cursos y recordatorios pendientes.
                </Text>
              </View>

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {studentName
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryEmoji}>
                  📚
                </Text>
              </View>

              <View style={styles.summaryInformation}>
                <Text style={styles.summaryNumber}>
                  {courses.length}
                </Text>

                <Text style={styles.summaryLabel}>
                  Cursos asignados
                </Text>
              </View>

              <Text style={styles.summaryMessage}>
                Tu carga académica actual
              </Text>
            </View>


            <View style={styles.sectionHeader}>
              <View style={styles.sectionInformation}>
                <Text style={styles.sectionTitle}>
                  Mis cursos
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Selecciona uno para ver sus recordatorios
                </Text>
              </View>

              <View style={styles.courseCounter}>
                <Text style={styles.courseCounterText}>
                  {courses.length}
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>
                📘
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              {loading
                ? 'Cargando tus cursos...'
                : 'No tienes cursos asignados'}
            </Text>

            {!loading ? (
              <Text style={styles.emptyDescription}>
                Cuando seas agregado a un curso,
                aparecerá automáticamente aquí.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.courseCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                'StudentCourseDetail',
                {
                  course: item,
                }
              )
            }
          >
            <View style={styles.courseHeader}>
              <View style={styles.courseIcon}>
                <Text style={styles.courseIconText}>
                  {index + 1}
                </Text>
              </View>

              <View style={styles.courseInformation}>
                <Text
                  style={styles.subjectName}
                  numberOfLines={2}
                >
                  {item.subjectName ||
                    'Asignatura'}
                </Text>

                {item.careerName ? (
                  <Text
                    style={styles.careerName}
                    numberOfLines={1}
                  >
                    {item.careerName}
                  </Text>
                ) : null}
              </View>

              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>
                  ›
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>
                  👥
                </Text>

                <View>
                  <Text style={styles.detailLabel}>
                    Grupo
                  </Text>

                  <Text style={styles.detailValue}>
                    {item.group || 'Sin grupo'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>
                  🕒
                </Text>

                <View>
                  <Text style={styles.detailLabel}>
                    Turno
                  </Text>

                  <Text style={styles.detailValue}>
                    {item.shift === 'MATUTINO'
                      ? 'Matutino'
                      : 'Vespertino'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.teacherContainer}>
              <View style={styles.teacherAvatar}>
                <Text style={styles.teacherAvatarText}>
                  {(item.teacherName || 'P')
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.teacherInformation}>
                <Text style={styles.teacherLabel}>
                  Profesor
                </Text>

                <Text
                  style={styles.teacherName}
                  numberOfLines={1}
                >
                  {item.teacherName ||
                    'Sin profesor asignado'}
                </Text>
              </View>
            </View>

            <View style={styles.enterContainer}>
              <Text style={styles.enterText}>
                Ver recordatorios
              </Text>

              <Text style={styles.enterArrow}>
                →
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.logoutCard}
            activeOpacity={0.85}
            onPress={logout}
          >
            <View style={styles.logoutIcon}>
              <Text style={styles.logoutIconText}>
                ↪
              </Text>
            </View>

            <View style={styles.logoutInformation}>
              <Text style={styles.logoutTitle}>
                Cerrar sesión
              </Text>

              <Text style={styles.logoutDescription}>
                Salir de la cuenta del alumno
              </Text>
            </View>

            <Text style={styles.logoutArrow}>
              ›
            </Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },

  list: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
    flexGrow: 1,
  },

  headerCard: {
    minHeight: 170,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },

  headerInformation: {
    flex: 1,
    paddingRight: 14,
  },

  welcome: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },

  studentName: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
    marginBottom: 8,
  },

  headerDescription: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 14,
    lineHeight: 20,
  },

  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginRight: 14,
  },

  summaryEmoji: {
    fontSize: 25,
  },

  summaryInformation: {
    flex: 1,
  },

  summaryNumber: {
    color: '#111827',
    fontSize: 23,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 1,
  },

  summaryMessage: {
    maxWidth: 90,
    textAlign: 'right',
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 16,
  },

  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 7,
  },

  notificationButtonDisabled: {
    opacity: 0.65,
  },

  notificationButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  notificationButtonEmoji: {
    fontSize: 23,
  },

  notificationButtonInformation: {
    flex: 1,
  },

  notificationButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  notificationButtonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 17,
  },

  notificationButtonArrow: {
    color: '#FFFFFF',
    fontSize: 30,
    marginLeft: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionInformation: {
    flex: 1,
    paddingRight: 12,
  },

  sectionTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 3,
  },

  sectionSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
  },

  courseCounter: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
  },

  courseCounterText: {
    color: '#4338CA',
    fontSize: 15,
    fontWeight: '800',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 40,
    marginBottom: 20,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginBottom: 16,
  },

  emptyEmoji: {
    fontSize: 34,
  },

  emptyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyDescription: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },

  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    marginRight: 13,
  },

  courseIconText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  courseInformation: {
    flex: 1,
  },

  subjectName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  },

  careerName: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },

  arrowContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginLeft: 8,
  },

  arrow: {
    color: '#4F46E5',
    fontSize: 26,
    marginTop: -2,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 11,
  },

  detailIcon: {
    fontSize: 20,
    marginRight: 9,
  },

  detailLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  detailValue: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },

  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 12,
    marginBottom: 14,
  },

  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
    marginRight: 11,
  },

  teacherAvatarText: {
    color: '#4338CA',
    fontSize: 16,
    fontWeight: '800',
  },

  teacherInformation: {
    flex: 1,
  },

  teacherLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  teacherName: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },

  enterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingVertical: 11,
  },

  enterText: {
    color: '#4338CA',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 7,
  },

  enterArrow: {
    color: '#4338CA',
    fontSize: 17,
    fontWeight: '700',
  },

  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },

  logoutIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginRight: 13,
  },

  logoutIconText: {
    color: '#DC2626',
    fontSize: 22,
    fontWeight: '700',
  },

  logoutInformation: {
    flex: 1,
  },

  logoutTitle: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },

  logoutDescription: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  logoutArrow: {
    color: '#DC2626',
    fontSize: 28,
    marginLeft: 8,
  },
});