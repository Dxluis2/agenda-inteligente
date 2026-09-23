import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from '../../services/firebase/firebaseConfig';

export default function StudentRegisterScreen({ navigation }: any) {
  const [nombre, setNombre] = useState('');
  const [matricula, setMatricula] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const registrarAlumno = async () => {
    if (loading) return;

    if (!nombre || !matricula || !correo || !password || !confirmar || !codigo) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }

    if (password !== confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        correo.trim(),
        password
      );

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        nombre: nombre.trim(),
        matricula: matricula.trim(),
        correo: correo.trim(),
        codigoMateria: codigo.trim(),
        role: 'student',
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Éxito', 'Alumno registrado correctamente.');
      navigation.goBack();
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error Firebase', error.message || 'Ocurrió un error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro Alumno</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Matrícula"
        value={matricula}
        onChangeText={setMatricula}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmar}
        onChangeText={setConfirmar}
      />

      <TextInput
        style={styles.input}
        placeholder="Código de materia"
        autoCapitalize="characters"
        value={codigo}
        onChangeText={setCodigo}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={registrarAlumno}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Registrando...' : 'Registrarse'}
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#111827',
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

  button: {
    backgroundColor: '#2563EB',
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
    fontWeight: '600',
    fontSize: 16,
  },
});