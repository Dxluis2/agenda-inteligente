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
import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../../services/firebase/firebaseConfig';

import { NotificationService } from '../../services/notifications/NotificationService';

export default function StudentLoginScreen({
  navigation,
}: any) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

const guardarPushToken = async (
  userId: string
) => {
  Alert.alert(
    'Paso 1',
    'Iniciando registro del dispositivo'
  );

  try {
    const expoPushToken =
      await NotificationService.getExpoPushToken();

    Alert.alert(
      'Paso 2',
      expoPushToken
        ? `Token obtenido: ${expoPushToken.substring(0, 25)}...`
        : 'El servicio devolvió un token vacío'
    );

    if (!expoPushToken) {
      return;
    }

    await setDoc(
      doc(db, 'users', userId),
      {
        expoPushToken,
        pushNotificationsEnabled: true,
        pushTokenUpdatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    Alert.alert(
      'Paso 3',
      'El token se guardó correctamente en Firestore.'
    );
  } catch (error: any) {
    Alert.alert(
      'Error del token',
      error?.message ||
        String(error) ||
        'Error desconocido'
    );
  }
};

const iniciarSesion = async () => {
  const normalizedEmail = correo.trim();

  if (!normalizedEmail || !password) {
    Alert.alert(
      'Campos incompletos',
      'Ingresa tu correo y contraseña.'
    );
    return;
  }

  try {
    setLoading(true);

    const credential =
      await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

    Alert.alert(
      'Inicio correcto',
      'Firebase inició sesión. Ahora se registrará el teléfono.',
      [
        {
          text: 'Continuar',
          onPress: async () => {
            await guardarPushToken(
              credential.user.uid
            );

            navigation.replace('StudentHome');
          },
        },
      ]
    );
  } catch (error: any) {
    Alert.alert(
      'Error al iniciar sesión',
      error?.message ||
        'No fue posible iniciar sesión.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Alumno
      </Text>

      <Text style={styles.subtitle}>
        Inicia sesión para consultar tus tareas
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={correo}
        onChangeText={setCorreo}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.buttonDisabled,
        ]}
        onPress={iniciarSesion}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {loading
            ? 'Ingresando...'
            : 'Iniciar sesión'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.backText}>
          Volver
        </Text>
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
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
  },

  buttonDisabled: {
    opacity: 0.65,
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
  },
});