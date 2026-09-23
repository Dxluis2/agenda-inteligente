import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../../services/firebase/firebaseConfig';

export default function AdminLoginScreen({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const iniciarSesionAdmin = async () => {
    if (!correo || !password) {
      Alert.alert('Error', 'Ingresa correo y contraseña.');
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        correo.trim(),
        password
      );

      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert('Error', 'El usuario no existe en la base de datos.');
        return;
      }

      const userData = userSnap.data();

      if (userData.role !== 'admin') {
        Alert.alert('Acceso denegado', 'Esta cuenta no es de administrador.');
        return;
      }

      navigation.replace('AdminHome');
    } catch (error: any) {
      Alert.alert('Error Firebase', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administrador</Text>

      <Text style={styles.subtitle}>
        Inicia sesión para administrar el sistema
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#94A3B8"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={iniciarSesionAdmin}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('RegisterUser')}
      >
        <Text style={styles.registerText}>Crear Usuario</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 35,
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
  loginButton: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  loginText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#111827',
    borderRadius: 12,
    padding: 16,
  },
  registerText: {
    textAlign: 'center',
    color: '#111827',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    marginTop: 25,
    textAlign: 'center',
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
});