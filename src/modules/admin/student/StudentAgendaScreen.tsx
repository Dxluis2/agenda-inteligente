import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getAuth } from 'firebase/auth';
import { TaskProgressService } from '../../../services/task/TaskProgressService';

export default function StudentAgendaScreen() {
  const [tasks, setTasks] = useState<any[]>([]);

  const loadTasks = async () => {
    const user = getAuth().currentUser;

    if (!user) return;

    const data = await TaskProgressService.getStudentTasks(user.uid);

    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const completeTask = async (task: any) => {
    await TaskProgressService.completeTask(task.id);

    Alert.alert('Correcto', 'Recordatorio completado.');

    loadTasks();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No tienes recordatorios.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text>{item.description}</Text>

            <Text>
              📅 {item.dueDate}
            </Text>

            <Text>
              🕒 {item.dueTime}
            </Text>

            <TouchableOpacity
              style={[
                styles.button,
                item.completed && styles.completed,
              ]}
              disabled={item.completed}
              onPress={() => completeTask(item)}
            >
              <Text style={styles.buttonText}>
                {item.completed
                  ? 'Completada'
                  : 'Marcar completada'}
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
    padding: 20,
  },

  card: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },

  completed: {
    backgroundColor: '#16A34A',
  },

  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
  },

  empty: {
    textAlign: 'center',
    marginTop: 80,
  },
});