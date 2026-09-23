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
import PrimaryButton from '../../../components/buttons/PrimaryButton';

import { SubjectService } from '../../../services/subject/SubjectService';
import { Subject } from '../../../types';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../../theme';

export default function AdminSubjectListScreen({
  navigation,
  route,
}: any) {
  const { career } = route.params;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarMaterias = async () => {
    try {
      setLoading(true);

      const data =
        await SubjectService.getSubjectsByCareer(career.id);

      const activeSubjects = data
        .filter((subject) => subject.active !== false)
        .sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );

      setSubjects(activeSubjects);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message ||
          'No se pudieron cargar las asignaturas.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'focus',
      cargarMaterias
    );

    return unsubscribe;
  }, [navigation]);

  const eliminarAsignatura = (subject: Subject) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Seguro que deseas eliminar la asignatura "${subject.nombre}"?`,
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
              await SubjectService.deleteSubject(
                subject.id
              );

              await cargarMaterias();

              Alert.alert(
                'Asignatura eliminada',
                'La asignatura fue eliminada correctamente.'
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message ||
                  'No se pudo eliminar la asignatura.'
              );
            }
          },
        },
      ]
    );
  };

  const filtered = subjects.filter((item) => {
    const text = search.trim().toLowerCase();

    return (
      item.nombre.toLowerCase().includes(text) ||
      item.codigo.toLowerCase().includes(text) ||
      item.descripcion?.toLowerCase().includes(text)
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{career.nombre}</Text>

      <Text style={styles.subtitle}>
        Asignaturas
      </Text>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar asignatura..."
      />

      <PrimaryButton
        title="Nueva asignatura"
        onPress={() =>
          navigation.navigate('AdminCreateSubject', {
            career,
          })
        }
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={cargarMaterias}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? 'Cargando asignaturas...'
              : 'No hay asignaturas registradas.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('CourseList', {
                  subject: item,
                })
              }
            >
              <Text style={styles.name}>
                {item.nombre}
              </Text>

              <Text style={styles.code}>
                {item.codigo}
              </Text>

              {item.descripcion ? (
                <Text style={styles.description}>
                  {item.descripcion}
                </Text>
              ) : null}
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  navigation.navigate('EditSubject', {
                    subject: item,
                  })
                }
              >
                <Text style={styles.actionText}>
                  Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  eliminarAsignatura(item)
                }
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

  name: {
    fontSize: Typography.body,
    fontWeight: '900',
    color: Colors.text,
  },

  code: {
    color: Colors.primary,
    marginTop: 5,
    fontWeight: '800',
  },

  description: {
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
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