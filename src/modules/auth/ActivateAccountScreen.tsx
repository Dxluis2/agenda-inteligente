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
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../../services/firebase/firebaseConfig';

export default function ActivateAccountScreen({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  const activarCuenta = async () => {
    if (!correo || !password || !confirmar) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }

    if (!correo.endsWith('@gmail.com')) {
      Alert.alert('Error', 'Debes usar un correo Gmail.');
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

      const pendingQuery = query(
        collection(db, 'pendingUsers'),
        where('correo', '==', correo.trim().toLowerCase()),
        where('active', '==', true),
        where('completed', '==', false)
      );

      const pendingSnapshot = await getDocs(pendingQuery);

      if (pendingSnapshot.empty) {
        Alert.alert(
          'No autorizado',
          'Este correo no ha sido autorizado por el administrador.'
        );
        return;
      }

      const pendingDoc = pendingSnapshot.docs[0];
      const pendingData = pendingDoc.data();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        correo.trim().toLowerCase(),
        password
      );

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        nombre: pendingData.nombre,
        correo: pendingData.correo,
        matricula: pendingData.matricula || '',
        role: pendingData.role,
        active: true,
        createdAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'pendingUsers', pendingDoc.id), {
        completed: true,
        activatedAt: new Date().toISOString(),
      });

      Alert.alert('Éxito', 'Cuenta activada correctamente.');
      navigation.replace('Login');
    } catch (error: any) {
      Alert.alert('Error Firebase', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Activar cuenta</Text>

      <Text style={styles.subtitle}>
        Ingresa tu correo autorizado y crea tu contraseña.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Correo Gmail autorizado"
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

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={activarCuenta}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Activando...' : 'Activar cuenta'}
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
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 10,
    marginBottom: 30,
    fontSize: 16,
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
  disabled: {
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