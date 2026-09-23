import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import SearchBar from '../../../components/search/SearchBar';

import { db } from '../../../services/firebase/firebaseConfig';

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

type StudentUser = {
  id: string;
  uid: string;
  nombre: string;
  correo: string;
  matricula: string;
};

export default function AddStudentsScreen({
  navigation,
  route,
}: any) {
  const { course } = route.params;

  const [students, setStudents] = useState<StudentUser[]>([]);
  const [enrolledStudents, setEnrolledStudents] =
    useState<CourseStudent[]>([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);

      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('active', '==', true)
      );

      const snapshot = await getDocs(studentsQuery);

      const users: StudentUser[] = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,
          uid: data.uid || document.id,
          nombre: data.nombre || 'Sin nombre',
          correo: data.correo || '',
          matricula: data.matricula || '',
        };
      });

      const enrolled = await CourseStudentService.getStudents(course.id);

      users.sort((a, b) => a.nombre.localeCompare(b.nombre));

      setStudents(users);
      setEnrolledStudents(enrolled);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudieron cargar los alumnos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadStudents);

    return unsubscribe;
  }, [navigation]);

  const enrolledIds = useMemo(
    () =>
      new Set(
        enrolledStudents.map((student) => student.studentId)
      ),
    [enrolledStudents]
  );

  const availableStudents = students.filter((student) => {
    const text = search.trim().toLowerCase();

    const matchesSearch =
      student.nombre.toLowerCase().includes(text) ||
      student.matricula.toLowerCase().includes(text) ||
      student.correo.toLowerCase().includes(text);

    return matchesSearch && !enrolledIds.has(student.uid);
  });

  const addStudent = async (student: StudentUser) => {
    try {
      await CourseStudentService.addStudent({
        courseId: course.id,
        studentId: student.uid,
        nombre: student.nombre,
        matricula: student.matricula,
        correo: student.correo,
        active: true,
      });

      const updatedStudents =
        await CourseStudentService.getStudents(course.id);

      await CourseService.updateStudentsCount(
        course.id,
        updatedStudents.length
      );

      setEnrolledStudents(updatedStudents);

      Alert.alert(
        'Alumno agregado',
        `${student.nombre} fue agregado correctamente.`
      );
    } catch (error: any) {
      Alert.alert(
        'No se pudo agregar',
        error.message || 'El alumno ya pertenece al curso.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar alumnos</Text>

      <Text style={styles.subtitle}>
        {course.subjectName} · Grupo {course.group}
      </Text>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar alumno disponible"
      />

      <FlatList
        data={availableStudents}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadStudents}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? 'Cargando alumnos...'
              : 'No hay alumnos disponibles para agregar.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.information}>
              <Text style={styles.name}>{item.nombre}</Text>

              <Text style={styles.data}>
                Matrícula: {item.matricula}
              </Text>

              <Text style={styles.data}>{item.correo}</Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addStudent(item)}
            >
              <Text style={styles.buttonText}>Agregar</Text>
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

  information: {
    marginBottom: 12,
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

  addButton: {
    backgroundColor: Colors.primary,
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
    marginTop: 60,
    fontWeight: '700',
  },
});