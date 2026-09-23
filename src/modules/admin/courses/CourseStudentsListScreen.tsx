import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import SearchBar from '../../../components/search/SearchBar';

import {
  CourseStudent,
  CourseStudentService,
} from '../../../services/courseStudent/CourseStudentService';

import { CourseService } from '../../../services/course/CourseService';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../../theme';

export default function CourseStudentsListScreen({
  navigation,
  route,
}: any) {
  const { course } = route.params;

  const [students, setStudents] =
    useState<CourseStudent[]>([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);

      const data =
        await CourseStudentService.getStudents(
          course.id
        );

      data.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );

      setStudents(data);

      await CourseService.updateStudentsCount(
        course.id,
        data.length
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message ||
          'No se pudieron cargar los alumnos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe =
      navigation.addListener('focus', loadStudents);

    return unsubscribe;
  }, [navigation]);

  const eliminarAlumno = (
    student: CourseStudent
  ) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Seguro que deseas quitar a "${student.nombre}" de este curso?`,
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
              await CourseStudentService.removeStudent(
                student.id
              );

              await loadStudents();

              Alert.alert(
                'Alumno eliminado',
                'El alumno fue retirado correctamente.'
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message ||
                  'No se pudo eliminar al alumno.'
              );
            }
          },
        },
      ]
    );
  };

  const filteredStudents = students.filter(
    (student) => {
      const text = search.trim().toLowerCase();

      return (
        student.nombre
          .toLowerCase()
          .includes(text) ||
        student.matricula
          .toLowerCase()
          .includes(text) ||
        student.correo
          ?.toLowerCase()
          .includes(text)
      );
    }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Lista de alumnos
      </Text>

      <Text style={styles.subtitle}>
        {course.subjectName} · Grupo {course.group}
      </Text>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar alumno agregado"
      />

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadStudents}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? 'Cargando alumnos...'
              : 'No hay alumnos agregados al curso.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.nombre}
            </Text>

            <Text style={styles.data}>
              Matrícula: {item.matricula}
            </Text>

            {item.correo ? (
              <Text style={styles.data}>
                {item.correo}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                eliminarAlumno(item)
              }
            >
              <Text style={styles.buttonText}>
                Eliminar
              </Text>
            </TouchableOpacity>
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
    marginBottom: Spacing.md,
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

  name: {
    fontSize: Typography.body,
    fontWeight: '900',
    color: Colors.text,
  },

  data: {
    color: Colors.textSecondary,
    marginTop: 4,
  },

  deleteButton: {
    backgroundColor: Colors.danger,
    paddingVertical: 11,
    borderRadius: Radius.md,
    marginTop: 14,
  },

  buttonText: {
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