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

import { CourseService } from '../../../services/course/CourseService';
import { Course } from '../../../types';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../../theme';

export default function CourseListScreen({
  navigation,
  route,
}: any) {
  const { subject } = route.params;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);

      const data =
        await CourseService.getCoursesBySubject(
          subject.id
        );

      const activeCourses = data
        .filter((course) => course.active !== false)
        .sort((a, b) =>
          a.group.localeCompare(b.group, undefined, {
            numeric: true,
          })
        );

      setCourses(activeCourses);
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
    const unsubscribe =
      navigation.addListener('focus', loadCourses);

    return unsubscribe;
  }, [navigation]);

  const eliminarCurso = (course: Course) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Seguro que deseas eliminar el grupo ${course.group} de ${course.subjectName}?`,
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
              await CourseService.deleteCourse(
                course.id
              );

              await loadCourses();

              Alert.alert(
                'Curso eliminado',
                'El curso fue eliminado correctamente.'
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message ||
                  'No se pudo eliminar el curso.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {subject.nombre}
      </Text>

      <Text style={styles.subtitle}>
        Cursos asignados
      </Text>

      <PrimaryButton
        title="Nuevo curso"
        onPress={() =>
          navigation.navigate('CreateCourse', {
            subject,
          })
        }
      />

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadCourses}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? 'Cargando cursos...'
              : 'No hay cursos registrados.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('CourseDetail', {
                  course: item,
                })
              }
            >
              <Text style={styles.group}>
                Grupo {item.group}
              </Text>

              <Text style={styles.info}>
                Profesor: {item.teacherName}
              </Text>

              <Text style={styles.info}>
                Turno:{' '}
                {item.shift === 'MATUTINO'
                  ? 'Matutino'
                  : 'Vespertino'}
              </Text>

              <Text style={styles.info}>
                Alumnos: {item.students || 0}
              </Text>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  navigation.navigate('EditCourse', {
                    course: item,
                  })
                }
              >
                <Text style={styles.actionText}>
                  Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => eliminarCurso(item)}
              >
                <Text style={styles.actionText}>
                  Eliminar
                </Text>
              </TouchableOpacity>
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
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },

  list: {
    paddingTop: 18,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: Radius.lg,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },

  group: {
    fontWeight: '900',
    fontSize: Typography.body,
    color: Colors.text,
  },

  info: {
    color: Colors.textSecondary,
    marginTop: 5,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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

  actionText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '800',
  },

  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 60,
    fontWeight: '700',
  },
});