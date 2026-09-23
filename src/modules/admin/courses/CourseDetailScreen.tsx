import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../../components/buttons/PrimaryButton';
import { Colors } from '../../../theme';

export default function CourseDetailScreen({
  navigation,
  route,
}: any) {
  const { course } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {course.subjectName}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Grupo
        </Text>

        <Text style={styles.value}>
          {course.group}
        </Text>

        <Text style={styles.label}>
          Profesor
        </Text>

        <Text style={styles.value}>
          {course.teacherName}
        </Text>

        <Text style={styles.label}>
          Turno
        </Text>

        <Text style={styles.value}>
          {course.shift}
        </Text>

        <Text style={styles.label}>
          Alumnos registrados
        </Text>

        <Text style={styles.value}>
          {course.students}
        </Text>
      </View>

      <PrimaryButton
        title="Agregar alumnos"
        onPress={() =>
          navigation.navigate('AddStudents', {
            course,
          })
        }
      />

      <View style={{ height: 15 }} />

      <PrimaryButton
        title="Ver lista de alumnos"
        onPress={() =>
          navigation.navigate('CourseStudentsList', {
            course,
          })
        }
      />

      <View style={{ height: 15 }} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.background,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
    color: Colors.text,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 30,
    elevation: 3,
  },

  label: {
    fontWeight: '700',
    color: '#555',
    marginTop: 10,
  },

  value: {
    fontSize: 17,
    color: Colors.text,
  },
});