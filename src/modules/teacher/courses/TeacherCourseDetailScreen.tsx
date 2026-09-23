import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../../theme';

export default function TeacherCourseDetailScreen({
  navigation,
  route,
}: any) {
  const { course } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {course.subjectName}
      </Text>

      <Text style={styles.subtitle}>
        Grupo {course.group}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Profesor</Text>
        <Text style={styles.value}>
          {course.teacherName}
        </Text>

        <Text style={styles.label}>Turno</Text>
        <Text style={styles.value}>
          {course.shift === 'MATUTINO'
            ? 'Matutino'
            : 'Vespertino'}
        </Text>

        <Text style={styles.label}>Alumnos</Text>
        <Text style={styles.value}>
          {course.students || 0}
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title="Crear recordatorio"
          onPress={() =>
            navigation.navigate('CreateTask', {
              course,
            })
          }
        />

        <PrimaryButton
          title="Ver recordatorios"
          onPress={() =>
            navigation.navigate('TasksList', {
              course,
            })
          }
        />
        <PrimaryButton
        title="Agregar alumnos"
        onPress={() =>
            navigation.navigate('AddStudents', {
                course,
            })
        }
/>

<PrimaryButton
  title="Ver lista de alumnos"
  onPress={() =>
    navigation.navigate('CourseStudentsList', {
      course,
    })
  }
/>

        <SecondaryButton
          title="Volver"
          onPress={() => navigation.goBack()}
        />
      </View>
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

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },

  label: {
    color: Colors.textSecondary,
    fontWeight: '700',
    marginTop: 10,
  },

  value: {
    color: Colors.text,
    fontWeight: '900',
    marginTop: 3,
  },

  actions: {
    gap: 12,
  },
});