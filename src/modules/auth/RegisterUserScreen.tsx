import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';

import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';

type UserRole = 'admin' | 'teacher' | 'student';

export default function RegisterUserScreen({ navigation }: any) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [matricula, setMatricula] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [loading, setLoading] = useState(false);

  const autorizarUsuario = async () => {
    if (!nombre || !correo) {
      Alert.alert('Error', 'Completa nombre y correo.');
      return;
    }

    if (!correo.endsWith('@gmail.com')) {
      Alert.alert('Error', 'El correo debe ser Gmail.');
      return;
    }

    if (role === 'student' && !matricula) {
      Alert.alert('Error', 'La matrícula es obligatoria para alumnos.');
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'pendingUsers'), {
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        matricula: role === 'student' ? matricula.trim() : '',
        role,
        active: true,
        completed: false,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Éxito', 'Usuario autorizado correctamente.');

      setNombre('');
      setCorreo('');
      setMatricula('');
      setRole('teacher');

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error Firebase', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Autorizar Usuario</Text>
      <Text style={styles.subtitle}>
        Registra el correo para que el usuario active su cuenta
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />

      {role === 'student' && (
        <TextInput
          style={styles.input}
          placeholder="Matrícula"
          value={matricula}
          onChangeText={setMatricula}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Correo Gmail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />

      <Text style={styles.label}>Selecciona el rol</Text>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'admin' && styles.roleSelected]}
          onPress={() => setRole('admin')}
        >
          <Text style={[styles.roleText, role === 'admin' && styles.roleTextSelected]}>
            Admin
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === 'teacher' && styles.roleSelected]}
          onPress={() => setRole('teacher')}
        >
          <Text style={[styles.roleText, role === 'teacher' && styles.roleTextSelected]}>
            Profesor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === 'student' && styles.roleSelected]}
          onPress={() => setRole('student')}
        >
          <Text style={[styles.roleText, role === 'student' && styles.roleTextSelected]}>
            Alumno
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={autorizarUsuario}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Autorizando...' : 'Autorizar Usuario'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 30,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  roleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  roleSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  roleText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#111827',
  },
  roleTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backText: {
    marginTop: 25,
    textAlign: 'center',
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
});