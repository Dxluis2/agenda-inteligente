import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../../services/firebase/firebaseConfig';

import { NotificationService } from '../../services/notifications/NotificationService';

export default function LoginScreen({
  navigation,
}: any) {
  const { width, height } = useWindowDimensions();

  const isSmallScreen = height < 700;
  const isNarrowScreen = width < 360;

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  const registrarDispositivoAlumno = async (
    userId: string
  ) => {
    try {
      const expoPushToken =
        await NotificationService.getExpoPushToken();

      if (!expoPushToken) {
        Alert.alert(
          'Aviso',
          'La sesión se inició, pero no fue posible registrar este dispositivo para notificaciones push.'
        );

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
    } catch (error: any) {
      console.error(
        'Error registrando el dispositivo:',
        error
      );

      Alert.alert(
        'Aviso',
        error?.message ||
          'La sesión se inició, pero ocurrió un problema al registrar las notificaciones.'
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

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );

      const userReference = doc(
        db,
        'users',
        userCredential.user.uid
      );

      const userSnap = await getDoc(
        userReference
      );

      if (!userSnap.exists()) {
        Alert.alert(
          'Error',
          'El usuario no existe en Firestore.'
        );

        return;
      }

      const userData = userSnap.data();

      if (userData.active === false) {
        Alert.alert(
          'Acceso denegado',
          'Tu cuenta está desactivada.'
        );

        return;
      }

      if (userData.role === 'admin') {
        navigation.replace('AdminTabs');
        return;
      }

      if (userData.role === 'teacher') {
        navigation.replace('TeacherHome');
        return;
      }

      if (userData.role === 'student') {
        await registrarDispositivoAlumno(
          userCredential.user.uid
        );

        navigation.replace('StudentHome');
        return;
      }

      Alert.alert(
        'Error',
        'Rol de usuario no válido.'
      );
    } catch (error: any) {
      Alert.alert(
        'No se pudo iniciar sesión',
        error?.message ||
          'Verifica tus datos e inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F8FF"
      />

      <View style={styles.background}>
        <View
          style={[
            styles.topShape,
            {
              width: width * 0.78,
              height: width * 0.78,
            },
          ]}
        />

        <View
          style={[
            styles.bottomShape,
            {
              width: width * 1.25,
              height: width * 1.25,
            },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isNarrowScreen
                ? 18
                : 24,
              paddingTop: isSmallScreen
                ? 18
                : 28,
              paddingBottom: isSmallScreen
                ? 26
                : 40,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>

            <Text style={styles.backLabel}>
              Volver
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.header,
              {
                marginTop: isSmallScreen
                  ? 24
                  : 42,
              },
            ]}
          >
            <View
              style={[
                styles.logoContainer,
                isSmallScreen &&
                  styles.logoContainerSmall,
              ]}
            >
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>

            <View style={styles.welcomeBadge}>
              <Text style={styles.welcomeBadgeIcon}>
                👋
              </Text>

              <Text style={styles.welcomeBadgeText}>
                Bienvenido de nuevo
              </Text>
            </View>

            <Text
              style={[
                styles.title,
                isNarrowScreen &&
                  styles.titleNarrow,
              ]}
            >
              Inicia sesión
            </Text>

            <Text style={styles.subtitle}>
              Accede a tu cuenta para continuar con
              tus cursos, tareas y recordatorios.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Correo electrónico
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Text style={styles.inputIcon}>
                    ✉
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="nombre@correo.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={correo}
                  onChangeText={setCorreo}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Contraseña
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Text style={styles.inputIcon}>
                    🔒
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={iniciarSesion}
                />

                <TouchableOpacity
                  style={styles.passwordButton}
                  onPress={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text
                    style={styles.passwordButtonText}
                  >
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading &&
                  styles.loginButtonDisabled,
              ]}
              onPress={iniciarSesion}
              disabled={loading}
              activeOpacity={0.88}
            >
              <Text style={styles.loginButtonText}>
                {loading
                  ? 'Ingresando...'
                  : 'Iniciar sesión'}
              </Text>

              {!loading ? (
                <View style={styles.loginArrowBox}>
                  <Text style={styles.loginArrow}>
                    →
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>

            <View style={styles.separator}>
              <View style={styles.separatorLine} />

              <Text style={styles.separatorText}>
                ¿Aún no activas tu cuenta?
              </Text>

              <View style={styles.separatorLine} />
            </View>

            <TouchableOpacity
              style={styles.activateButton}
              onPress={() =>
                navigation.navigate(
                  'ActivateAccount'
                )
              }
              disabled={loading}
              activeOpacity={0.85}
            >
              <View style={styles.activateIconBox}>
                <Text style={styles.activateIcon}>
                  ✓
                </Text>
              </View>

              <View style={styles.activateInformation}>
                <Text style={styles.activateTitle}>
                  Activar cuenta
                </Text>

                <Text
                  style={styles.activateDescription}
                >
                  Configura tu acceso por primera vez
                </Text>
              </View>

              <Text style={styles.activateArrow}>
                ›
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.securityCard}>
            <View style={styles.securityIconBox}>
              <Text style={styles.securityIcon}>
                🛡️
              </Text>
            </View>

            <View style={styles.securityInformation}>
              <Text style={styles.securityTitle}>
                Acceso seguro
              </Text>

              <Text style={styles.securityDescription}>
                Tu sesión y tus datos académicos se
                mantienen protegidos.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FF',
  },

  keyboardContainer: {
    flex: 1,
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  topShape: {
    position: 'absolute',
    top: -120,
    right: -120,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    opacity: 0.72,
  },

  bottomShape: {
    position: 'absolute',
    bottom: -320,
    left: -150,
    borderRadius: 999,
    backgroundColor: '#E0E7FF',
    opacity: 0.7,
  },

  scrollContent: {
    flexGrow: 1,
  },

  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 12,
  },

  backArrow: {
    color: '#2563EB',
    fontSize: 31,
    fontWeight: '500',
    marginTop: -4,
  },

  backLabel: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 4,
  },

  header: {
    alignItems: 'center',
  },

  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 27,
    padding: 3,
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.3,
    shadowRadius: 13,
    elevation: 8,
  },

  logoContainerSmall: {
    width: 76,
    height: 76,
    borderRadius: 23,
  },

  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
  },

  welcomeBadgeIcon: {
    fontSize: 14,
    marginRight: 7,
  },

  welcomeBadgeText: {
    color: '#3730A3',
    fontSize: 12,
    fontWeight: '800',
  },

  title: {
    color: '#0F172A',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.7,
    marginTop: 14,
  },

  titleNarrow: {
    fontSize: 30,
  },

  subtitle: {
    maxWidth: 430,
    color: '#64748B',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
  },

  formCard: {
    marginTop: 30,
    padding: 20,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.11,
    shadowRadius: 18,
    elevation: 7,
  },

  inputGroup: {
    marginBottom: 17,
  },

  inputLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 2,
  },

  inputContainer: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    paddingHorizontal: 10,
  },

  inputIconBox: {
    width: 39,
    height: 39,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    marginRight: 8,
  },

  inputIcon: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '900',
  },

  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    paddingVertical: 15,
  },

  passwordButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginLeft: 4,
  },

  passwordButtonText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '900',
  },

  loginButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 17,
    marginTop: 4,
    paddingHorizontal: 16,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  loginButtonDisabled: {
    opacity: 0.62,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  loginArrowBox: {
    position: 'absolute',
    right: 13,
    width: 35,
    height: 35,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  loginArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 21,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  separatorText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginHorizontal: 10,
    textAlign: 'center',
  },

  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 66,
    padding: 12,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },

  activateIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    marginRight: 12,
  },

  activateIcon: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '900',
  },

  activateInformation: {
    flex: 1,
  },

  activateTitle: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '900',
  },

  activateDescription: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  activateArrow: {
    color: '#2563EB',
    fontSize: 29,
    marginLeft: 8,
    marginTop: -3,
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  securityIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    marginRight: 12,
  },

  securityIcon: {
    fontSize: 20,
  },

  securityInformation: {
    flex: 1,
  },

  securityTitle: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '900',
  },

  securityDescription: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});