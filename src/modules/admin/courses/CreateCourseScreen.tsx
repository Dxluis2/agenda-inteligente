import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AppInput from '../../../components/inputs/AppInput';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import SearchBar from '../../../components/search/SearchBar';

import {
  Teacher,
  TeacherService,
} from '../../../services/teacher/TeacherService';

import { CourseService } from '../../../services/course/CourseService';

import {
  Colors,
  Radius,
  Spacing,
  Typography,
} from '../../../theme';

type Shift = 'MATUTINO' | 'VESPERTINO';

export default function CreateCourseScreen({
  navigation,
  route,
}: any) {
  const { subject } = route.params;

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] =
    useState<Teacher | null>(null);

  const [teacherSearch, setTeacherSearch] = useState('');
  const [group, setGroup] = useState('');
  const [shift, setShift] = useState<Shift>('MATUTINO');

  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);

      const data = await TeacherService.getTeachers();

      data.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );

      setTeachers(data);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message ||
          'No se pudieron cargar los profesores.'
      );
    } finally {
      setLoadingTeachers(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    const text = teacherSearch.trim().toLowerCase();

    return teachers.filter((teacher) => {
      return (
        teacher.nombre
          .toLowerCase()
          .includes(text) ||
        teacher.correo
          .toLowerCase()
          .includes(text)
      );
    });
  }, [teachers, teacherSearch]);

  const saveCourse = async () => {
    if (!group.trim()) {
      Alert.alert(
        'Campo obligatorio',
        'Escribe el grupo.'
      );
      return;
    }

    if (!selectedTeacher) {
      Alert.alert(
        'Profesor requerido',
        'Selecciona un profesor.'
      );
      return;
    }

    if (!subject?.id) {
      Alert.alert(
        'Error',
        'No se recibió correctamente la asignatura.'
      );
      return;
    }

    try {
      setLoading(true);

      await CourseService.createCourse({
        careerId: subject.careerId,
        careerName: subject.careerName,

        subjectId: subject.id,
        subjectName: subject.nombre,

        teacherId:
          selectedTeacher.uid ||
          selectedTeacher.id,

        teacherName:
          selectedTeacher.nombre,

        group: group.trim().toUpperCase(),
        shift,
      });

      Alert.alert(
        'Curso creado',
        `${subject.nombre}, grupo ${group
          .trim()
          .toUpperCase()}, fue registrado correctamente.`,
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.log(
        'ERROR AL CREAR CURSO:',
        error
      );

      Alert.alert(
        'Error al guardar',
        error.message ||
          'No se pudo crear el curso.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        Nuevo curso
      </Text>

      <Text style={styles.subtitle}>
        {subject?.nombre ||
          'Asignatura no disponible'}
      </Text>

      <AppInput
        label="Grupo"
        placeholder="Ej. 101"
        value={group}
        onChangeText={setGroup}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>
        Profesor
      </Text>

      <SearchBar
        value={teacherSearch}
        onChangeText={setTeacherSearch}
        placeholder="Buscar profesor por nombre o correo"
      />

      {loadingTeachers ? (
        <Text style={styles.helperText}>
          Cargando profesores...
        </Text>
      ) : teachers.length === 0 ? (
        <Text style={styles.errorText}>
          No existen profesores activos.
        </Text>
      ) : filteredTeachers.length === 0 ? (
        <Text style={styles.helperText}>
          No se encontraron profesores.
        </Text>
      ) : (
        filteredTeachers.map((teacher) => {
          const selected =
            selectedTeacher?.id === teacher.id;

          return (
            <TouchableOpacity
              key={teacher.id}
              style={[
                styles.option,
                selected &&
                  styles.optionSelected,
              ]}
              activeOpacity={0.85}
              onPress={() =>
                setSelectedTeacher(teacher)
              }
            >
              <Text
                style={[
                  styles.optionTitle,
                  selected &&
                    styles.optionTitleSelected,
                ]}
              >
                {teacher.nombre}
              </Text>

              <Text
                style={[
                  styles.optionSubtitle,
                  selected &&
                    styles.optionSubtitleSelected,
                ]}
              >
                {teacher.correo}
              </Text>
            </TouchableOpacity>
          );
        })
      )}

      <Text style={styles.label}>
        Turno
      </Text>

      <View style={styles.shiftRow}>
        <TouchableOpacity
          style={[
            styles.shiftButton,
            shift === 'MATUTINO' &&
              styles.shiftSelected,
          ]}
          activeOpacity={0.85}
          onPress={() =>
            setShift('MATUTINO')
          }
        >
          <Text
            style={[
              styles.shiftText,
              shift === 'MATUTINO' &&
                styles.shiftTextSelected,
            ]}
          >
            Matutino
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.shiftButton,
            shift === 'VESPERTINO' &&
              styles.shiftSelected,
          ]}
          activeOpacity={0.85}
          onPress={() =>
            setShift('VESPERTINO')
          }
        >
          <Text
            style={[
              styles.shiftText,
              shift === 'VESPERTINO' &&
                styles.shiftTextSelected,
            ]}
          >
            Vespertino
          </Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton
        title="Guardar curso"
        onPress={saveCourse}
        loading={loading}
      />

      <SecondaryButton
        title="Cancelar"
        onPress={() =>
          navigation.goBack()
        }
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
    paddingBottom: 50,
  },

  title: {
    color: Colors.text,
    fontSize: Typography.h1,
    fontWeight: '900',
  },

  subtitle: {
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 28,
    fontSize: Typography.body,
  },

  label: {
    color: Colors.text,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 10,
  },

  helperText: {
    color: Colors.textSecondary,
    marginBottom: 18,
    textAlign: 'center',
  },

  errorText: {
    color: Colors.danger,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },

  option: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 15,
    marginBottom: 10,
  },

  optionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  optionTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '800',
  },

  optionTitleSelected: {
    color: Colors.white,
  },

  optionSubtitle: {
    color: Colors.textSecondary,
    marginTop: 3,
  },

  optionSubtitleSelected: {
    color: '#DBEAFE',
  },

  shiftRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },

  shiftButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 15,
  },

  shiftSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  shiftText: {
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '800',
  },

  shiftTextSelected: {
    color: Colors.white,
  },
});