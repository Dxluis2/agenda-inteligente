import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { signOut } from 'firebase/auth';

import {
  auth,
  db,
} from '../../services/firebase/firebaseConfig';

type DashboardData = {
  users: number;
  teachers: number;
  students: number;
  careers: number;
  subjects: number;
  courses: number;
  pendingUsers: number;
};

type SummaryCardProps = {
  icon: string;
  number: number;
  label: string;
  description: string;
  iconBackground: string;
  numberColor: string;
  compact: boolean;
};

type MenuCardProps = {
  icon: string;
  title: string;
  description: string;
  iconBackground: string;
  onPress: () => void;
  counter?: number;
  counterColor?: string;
};

const initialData: DashboardData = {
  users: 0,
  teachers: 0,
  students: 0,
  careers: 0,
  subjects: 0,
  courses: 0,
  pendingUsers: 0,
};

function SummaryCard({
  icon,
  number,
  label,
  description,
  iconBackground,
  numberColor,
  compact,
}: SummaryCardProps) {
  return (
    <View
      style={[
        styles.summaryCard,
        compact
          ? styles.summaryCardCompact
          : styles.summaryCardWide,
      ]}
    >
      <View
        style={[
          styles.summaryIconContainer,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Text style={styles.summaryIcon}>
          {icon}
        </Text>
      </View>

      <Text
        style={[
          styles.summaryNumber,
          {
            color: numberColor,
          },
        ]}
      >
        {number}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text
        style={styles.summaryDescription}
        numberOfLines={2}
      >
        {description}
      </Text>
    </View>
  );
}

function MenuCard({
  icon,
  title,
  description,
  iconBackground,
  onPress,
  counter,
  counterColor = '#2563EB',
}: MenuCardProps) {
  return (
    <TouchableOpacity
      style={styles.menuCard}
      activeOpacity={0.86}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIconContainer,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Text style={styles.menuIcon}>
          {icon}
        </Text>
      </View>

      <View style={styles.menuInformation}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text
          style={styles.menuDescription}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      {typeof counter === 'number' &&
      counter > 0 ? (
        <View
          style={[
            styles.menuBadge,
            {
              backgroundColor: counterColor,
            },
          ]}
        >
          <Text style={styles.menuBadgeText}>
            {counter}
          </Text>
        </View>
      ) : null}

      <View style={styles.menuArrowContainer}>
        <Text style={styles.menuArrow}>
          ›
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminHomeScreen({
  navigation,
}: any) {
  const { width } = useWindowDimensions();

  const compactCards = width < 370;

  const [dashboard, setDashboard] =
    useState<DashboardData>(initialData);

  const [loading, setLoading] =
    useState(false);

  const loadDashboard = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const [
        usersSnapshot,
        careersSnapshot,
        subjectsSnapshot,
        coursesSnapshot,
        pendingSnapshot,
      ] = await Promise.all([
        getDocs(
          collection(db, 'users')
        ),

        getDocs(
          query(
            collection(db, 'careers'),
            where('active', '==', true)
          )
        ),

        getDocs(
          query(
            collection(db, 'subjects'),
            where('active', '==', true)
          )
        ),

        getDocs(
          query(
            collection(db, 'courses'),
            where('active', '==', true)
          )
        ),

        getDocs(
          query(
            collection(db, 'users'),
            where('status', '==', 'pending')
          )
        ),
      ]);

      let teachers = 0;
      let students = 0;

      usersSnapshot.forEach(
        (documentSnapshot) => {
          const data =
            documentSnapshot.data();

          if (data.role === 'teacher') {
            teachers += 1;
          }

          if (data.role === 'student') {
            students += 1;
          }
        }
      );

      setDashboard({
        users: usersSnapshot.size,
        teachers,
        students,
        careers: careersSnapshot.size,
        subjects: subjectsSnapshot.size,
        courses: coursesSnapshot.size,
        pendingUsers:
          pendingSnapshot.size,
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo cargar la información del panel.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'focus',
        loadDashboard
      );

    return unsubscribe;
  }, [navigation]);

  const totalAcademic = useMemo(
    () =>
      dashboard.careers +
      dashboard.subjects +
      dashboard.courses,
    [dashboard]
  );

  const activeAcademicMessage =
    totalAcademic === 1
      ? '1 elemento académico activo'
      : `${totalAcademic} elementos académicos activos`;

  const logout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que deseas cerrar la sesión del administrador?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);

              navigation.replace(
                'RoleSelection'
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error?.message ||
                  'No se pudo cerrar la sesión.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#172554"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.container
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadDashboard}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerCircleOne} />
          <View style={styles.headerCircleTwo} />

          <View style={styles.topBar}>
            <View style={styles.brandContainer}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}>
                  AI
                </Text>
              </View>

              <View style={styles.brandInformation}>
                <Text style={styles.brandName}>
                  Agenda
                </Text>

                <View style={styles.roleBadge}>
                  <View style={styles.roleDot} />

                  <Text style={styles.roleText}>
                    Administrador
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.refreshButton}
              activeOpacity={0.8}
              onPress={loadDashboard}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.refreshButtonText
                  }
                >
                  ↻
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <View
              style={
                styles.headerInformation
              }
            >
              <Text style={styles.welcome}>
                Bienvenido al panel
              </Text>

              <Text style={styles.title}>
                Administración
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                Gestiona usuarios, carreras,
                asignaturas y cursos desde un
                mismo lugar.
              </Text>
            </View>

            <View style={styles.adminAvatar}>
              <Text style={styles.adminEmoji}>
                👨‍💼
              </Text>
            </View>
          </View>

          <View style={styles.systemStatus}>
            <View
              style={styles.systemStatusIcon}
            >
              <Text
                style={
                  styles.systemStatusIconText
                }
              >
                ✓
              </Text>
            </View>

            <View
              style={
                styles.systemStatusInformation
              }
            >
              <Text
                style={
                  styles.systemStatusTitle
                }
              >
                Sistema conectado
              </Text>

              <Text
                style={
                  styles.systemStatusDescription
                }
              >
                La información se encuentra
                sincronizada con Firebase
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Resumen general
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Estado actual de la plataforma
            </Text>
          </View>

          <View
            style={
              styles.lastUpdateContainer
            }
          >
            <Text
              style={styles.lastUpdateText}
            >
              {loading
                ? 'Actualizando...'
                : 'Datos actuales'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="👥"
            number={dashboard.users}
            label="Usuarios"
            description="Cuentas registradas"
            iconBackground="#DBEAFE"
            numberColor="#2563EB"
            compact={compactCards}
          />

          <SummaryCard
            icon="👨‍🏫"
            number={dashboard.teachers}
            label="Profesores"
            description="Docentes registrados"
            iconBackground="#EDE9FE"
            numberColor="#7C3AED"
            compact={compactCards}
          />

          <SummaryCard
            icon="👨‍🎓"
            number={dashboard.students}
            label="Alumnos"
            description="Estudiantes activos"
            iconBackground="#DCFCE7"
            numberColor="#16A34A"
            compact={compactCards}
          />

          <SummaryCard
            icon="📚"
            number={dashboard.courses}
            label="Cursos"
            description="Cursos disponibles"
            iconBackground="#FEF3C7"
            numberColor="#D97706"
            compact={compactCards}
          />
        </View>

        <View style={styles.academicCard}>
          <View style={styles.academicIcon}>
            <Text
              style={styles.academicEmoji}
            >
              🎓
            </Text>
          </View>

          <View
            style={
              styles.academicInformation
            }
          >
            <Text
              style={styles.academicTitle}
            >
              Estructura académica
            </Text>

            <Text
              style={
                styles.academicSubtitle
              }
            >
              {activeAcademicMessage}
            </Text>

            <View
              style={
                styles.academicDetails
              }
            >
              <Text
                style={
                  styles.academicDetailText
                }
              >
                {dashboard.careers} carreras
              </Text>

              <View
                style={
                  styles.academicDetailDot
                }
              />

              <Text
                style={
                  styles.academicDetailText
                }
              >
                {dashboard.subjects}{' '}
                asignaturas
              </Text>

              <View
                style={
                  styles.academicDetailDot
                }
              />

              <Text
                style={
                  styles.academicDetailText
                }
              >
                {dashboard.courses} cursos
              </Text>
            </View>
          </View>

          <Text style={styles.academicNumber}>
            {totalAcademic}
          </Text>
        </View>

        {dashboard.pendingUsers > 0 ? (
          <TouchableOpacity
            style={styles.pendingBanner}
            activeOpacity={0.86}
            onPress={() =>
              navigation.navigate(
                'PendingUsers'
              )
            }
          >
            <View
              style={
                styles.pendingBannerIcon
              }
            >
              <Text
                style={
                  styles.pendingBannerEmoji
                }
              >
                🔔
              </Text>
            </View>

            <View
              style={
                styles.pendingBannerInformation
              }
            >
              <Text
                style={
                  styles.pendingBannerTitle
                }
              >
                Solicitudes pendientes
              </Text>

              <Text
                style={
                  styles.pendingBannerDescription
                }
              >
                Tienes {dashboard.pendingUsers}{' '}
                usuario
                {dashboard.pendingUsers !== 1
                  ? 's'
                  : ''}{' '}
                esperando autorización.
              </Text>
            </View>

            <View
              style={styles.pendingCount}
            >
              <Text
                style={
                  styles.pendingCountText
                }
              >
                {dashboard.pendingUsers}
              </Text>
            </View>

            <Text
              style={styles.pendingArrow}
            >
              ›
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Herramientas
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Accesos rápidos de administración
            </Text>
          </View>
        </View>

        <MenuCard
          icon="🎓"
          title="Carreras y cursos"
          description="Administra carreras, asignaturas, cursos, profesores y grupos."
          iconBackground="#DBEAFE"
          counter={dashboard.careers}
          onPress={() =>
            navigation.navigate(
              'CareerList'
            )
          }
        />

        <MenuCard
          icon="👥"
          title="Administrar usuarios"
          description="Consulta, busca y administra las cuentas registradas."
          iconBackground="#EDE9FE"
          counter={dashboard.users}
          counterColor="#7C3AED"
          onPress={() =>
            navigation.navigate(
              'UsersList'
            )
          }
        />

        <MenuCard
          icon="➕"
          title="Crear usuario"
          description="Registra una nueva cuenta de profesor, alumno o administrador."
          iconBackground="#DCFCE7"
          onPress={() =>
            navigation.navigate(
              'RegisterUser'
            )
          }
        />

        <MenuCard
          icon="⏳"
          title="Usuarios pendientes"
          description="Revisa y autoriza las solicitudes de acceso pendientes."
          iconBackground="#FFEDD5"
          counter={dashboard.pendingUsers}
          counterColor="#EA580C"
          onPress={() =>
            navigation.navigate(
              'PendingUsers'
            )
          }
        />

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.86}
          onPress={logout}
        >
          <View style={styles.logoutIcon}>
            <Text
              style={styles.logoutIconText}
            >
              ↪
            </Text>
          </View>

          <View
            style={
              styles.logoutInformation
            }
          >
            <Text
              style={styles.logoutTitle}
            >
              Cerrar sesión
            </Text>

            <Text
              style={
                styles.logoutSubtitle
              }
            >
              Salir de la cuenta del
              administrador
            </Text>
          </View>

          <View
            style={
              styles.logoutArrowContainer
            }
          >
            <Text
              style={styles.logoutArrow}
            >
              ›
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Agenda Inteligente · Panel de
          administración
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },

  container: {
    flexGrow: 1,
    backgroundColor: '#F3F6FB',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 120,
  },

  header: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#172554',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#172554',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.24,
    shadowRadius: 15,
    elevation: 8,
  },

  headerCircleOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor:
      'rgba(59, 130, 246, 0.25)',
    top: -90,
    right: -65,
  },

  headerCircleTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor:
      'rgba(99, 102, 241, 0.18)',
    bottom: -75,
    left: -45,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 11,
  },

  brandIconText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '900',
  },

  brandInformation: {
    flex: 1,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  roleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },

  roleText: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '700',
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.15)',
  },

  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '600',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 27,
  },

  headerInformation: {
    flex: 1,
    paddingRight: 13,
  },

  welcome: {
    color: '#BFDBFE',
    fontSize: 13,
    fontWeight: '700',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    marginTop: 3,
    letterSpacing: -0.6,
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },

  adminAvatar: {
    width: 65,
    height: 65,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor:
      'rgba(255,255,255,0.28)',
  },

  adminEmoji: {
    fontSize: 31,
  },

  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    padding: 12,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.12)',
  },

  systemStatusIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(74,222,128,0.18)',
    marginRight: 10,
  },

  systemStatusIconText: {
    color: '#86EFAC',
    fontSize: 16,
    fontWeight: '900',
  },

  systemStatusInformation: {
    flex: 1,
  },

  systemStatusTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  systemStatusDescription: {
    color: '#BFDBFE',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 27,
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },

  lastUpdateContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#E0E7FF',
  },

  lastUpdateText: {
    color: '#4338CA',
    fontSize: 10,
    fontWeight: '800',
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  summaryCardWide: {
    width: '48.2%',
  },

  summaryCardCompact: {
    width: '48%',
    paddingHorizontal: 12,
  },

  summaryIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  summaryIcon: {
    fontSize: 21,
  },

  summaryNumber: {
    fontSize: 27,
    fontWeight: '900',
  },

  summaryLabel: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 1,
  },

  summaryDescription: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  academicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 16,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  academicIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    marginRight: 12,
  },

  academicEmoji: {
    fontSize: 24,
  },

  academicInformation: {
    flex: 1,
  },

  academicTitle: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '900',
  },

  academicSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  academicDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 7,
  },

  academicDetailText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
  },

  academicDetailDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#93C5FD',
    marginHorizontal: 6,
  },

  academicNumber: {
    color: '#2563EB',
    fontSize: 29,
    fontWeight: '900',
    marginLeft: 8,
  },

  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  pendingBannerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEDD5',
    marginRight: 12,
  },

  pendingBannerEmoji: {
    fontSize: 21,
  },

  pendingBannerInformation: {
    flex: 1,
  },

  pendingBannerTitle: {
    color: '#9A3412',
    fontSize: 13,
    fontWeight: '900',
  },

  pendingBannerDescription: {
    color: '#C2410C',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  pendingCount: {
    minWidth: 29,
    height: 29,
    paddingHorizontal: 8,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
  },

  pendingCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  pendingArrow: {
    color: '#EA580C',
    fontSize: 27,
    marginLeft: 6,
  },

  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },

  menuIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  menuIcon: {
    fontSize: 23,
  },

  menuInformation: {
    flex: 1,
    paddingRight: 5,
  },

  menuTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },

  menuDescription: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  menuBadge: {
    minWidth: 29,
    height: 29,
    paddingHorizontal: 8,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },

  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  menuArrowContainer: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    marginLeft: 7,
  },

  menuArrow: {
    color: '#2563EB',
    fontSize: 24,
    marginTop: -3,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    padding: 15,
    borderRadius: 21,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },

  logoutIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE4E6',
    marginRight: 12,
  },

  logoutIconText: {
    color: '#E11D48',
    fontSize: 23,
    fontWeight: '900',
  },

  logoutInformation: {
    flex: 1,
  },

  logoutTitle: {
    color: '#BE123C',
    fontSize: 14,
    fontWeight: '900',
  },

  logoutSubtitle: {
    color: '#9F1239',
    fontSize: 10,
    marginTop: 3,
  },

  logoutArrowContainer: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE4E6',
  },

  logoutArrow: {
    color: '#E11D48',
    fontSize: 24,
    marginTop: -3,
  },

  footerText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
  },
});