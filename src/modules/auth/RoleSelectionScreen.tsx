import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export default function RoleSelectionScreen({
  navigation,
}: any) {
  const { width, height } = useWindowDimensions();

  const isSmallScreen = height < 700;
  const isNarrowScreen = width < 360;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F8FF"
      />

      <View style={styles.background}>
        <View
          style={[
            styles.topDecoration,
            {
              width: width * 0.72,
              height: width * 0.72,
            },
          ]}
        />

        <View
          style={[
            styles.middleDecoration,
            {
              width: width * 0.55,
              height: width * 0.55,
            },
          ]}
        />

        <View style={styles.bottomDecorationLight} />

        <View style={styles.bottomDecoration} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: isNarrowScreen
              ? 18
              : 24,
            paddingTop: isSmallScreen ? 18 : 30,
            paddingBottom: isSmallScreen
              ? 28
              : 45,
          },
        ]}
      >
        <View style={styles.header}>
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

          <View style={styles.brandInformation}>
            <Text
              style={[
                styles.appName,
                isNarrowScreen &&
                  styles.appNameSmall,
              ]}
              numberOfLines={1}
            >
              Agenda Inteligente
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.hero,
            {
              marginTop: isSmallScreen
                ? 38
                : Math.min(height * 0.09, 78),
            },
          ]}
        >
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeIcon}>
              ✨
            </Text>

            <Text style={styles.heroBadgeText}>
              Tu agenda académica
            </Text>
          </View>

          <Text
            style={[
              styles.title,
              isSmallScreen && styles.titleSmall,
              isNarrowScreen &&
                styles.titleNarrow,
            ]}
          >
            Organiza tus estudios de forma inteligente
          </Text>

          <Text
            style={[
              styles.subtitle,
              isSmallScreen &&
                styles.subtitleSmall,
            ]}
          >
            Consulta tus cursos, administra tareas y
            recibe recordatorios para mantenerte al
            día.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.loginCard}
          activeOpacity={0.88}
          onPress={() =>
            navigation.navigate('Login')
          }
        >
          <View style={styles.loginIconContainer}>
            <Text style={styles.loginIcon}>
              👤
            </Text>
          </View>

          <View style={styles.loginInformation}>
            <Text style={styles.loginTitle}>
              Iniciar sesión
            </Text>

            <Text style={styles.loginSubtitle}>
              Accede con tu cuenta escolar
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>
              ›
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.featuresCard}>
          <View style={styles.featuresHeader}>
            <Text style={styles.featuresTitle}>
              Todo en un solo lugar
            </Text>

            <Text style={styles.featuresSubtitle}>
              Herramientas para estudiantes,
              profesores y administradores.
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIconContainer,
                  styles.blueFeature,
                ]}
              >
                <Text style={styles.featureIcon}>
                  📚
                </Text>
              </View>

              <Text style={styles.featureTitle}>
                Cursos
              </Text>

              <Text style={styles.featureDescription}>
                Consulta tus materias y grupos.
              </Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIconContainer,
                  styles.yellowFeature,
                ]}
              >
                <Text style={styles.featureIcon}>
                  🔔
                </Text>
              </View>

              <Text style={styles.featureTitle}>
                Avisos
              </Text>

              <Text style={styles.featureDescription}>
                Recibe recordatorios importantes.
              </Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIconContainer,
                  styles.greenFeature,
                ]}
              >
                <Text style={styles.featureIcon}>
                  ✓
                </Text>
              </View>

              <Text style={styles.featureTitle}>
                Progreso
              </Text>

              <Text style={styles.featureDescription}>
                Organiza y completa tus tareas.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.securityMessage}>
          <Text style={styles.securityIcon}>
            🔒
          </Text>

          <Text style={styles.securityText}>
            Tus datos y tu sesión están protegidos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FF',
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  topDecoration: {
    position: 'absolute',
    top: -100,
    right: -100,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    opacity: 0.65,
  },

  middleDecoration: {
    position: 'absolute',
    top: '35%',
    left: -130,
    borderRadius: 999,
    backgroundColor: '#E0E7FF',
    opacity: 0.55,
  },

  bottomDecorationLight: {
    position: 'absolute',
    bottom: -120,
    left: -80,
    right: -80,
    height: 260,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: '#DBEAFE',
    transform: [
      {
        rotate: '-4deg',
      },
    ],
  },

  bottomDecoration: {
    position: 'absolute',
    bottom: -190,
    left: -90,
    right: -90,
    height: 280,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: '#2563EB',
    transform: [
      {
        rotate: '4deg',
      },
    ],
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoContainer: {
    width: 76,
    height: 76,
    borderRadius: 23,
    backgroundColor: '#2563EB',
    padding: 3,
    elevation: 8,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.26,
    shadowRadius: 10,
  },

  logoContainerSmall: {
    width: 66,
    height: 66,
    borderRadius: 20,
  },

  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  brandInformation: {
    flex: 1,
    marginLeft: 16,
  },

  appName: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  appNameSmall: {
    fontSize: 20,
  },

  versionBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  versionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },

  versionText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },

  hero: {
    maxWidth: 530,
  },

  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: 18,
  },

  heroBadgeIcon: {
    fontSize: 14,
    marginRight: 7,
  },

  heroBadgeText: {
    color: '#3730A3',
    fontSize: 12,
    fontWeight: '800',
  },

  title: {
    color: '#0F172A',
    fontSize: 37,
    lineHeight: 45,
    fontWeight: '900',
    letterSpacing: -1,
  },

  titleSmall: {
    fontSize: 32,
    lineHeight: 39,
  },

  titleNarrow: {
    fontSize: 29,
    lineHeight: 36,
  },

  subtitle: {
    marginTop: 18,
    color: '#64748B',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '500',
    maxWidth: 500,
  },

  subtitleSmall: {
    fontSize: 15,
    lineHeight: 23,
  },

  loginCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 34,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 7,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },

  loginIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },

  loginIcon: {
    fontSize: 28,
  },

  loginInformation: {
    flex: 1,
    marginLeft: 15,
  },

  loginTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '900',
  },

  loginSubtitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },

  arrowContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    marginLeft: 10,
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '600',
    marginTop: -3,
  },

  featuresCard: {
    marginTop: 22,
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.93)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  featuresHeader: {
    marginBottom: 18,
  },

  featuresTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
  },

  featuresSubtitle: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  featuresGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  featureItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },

  featureDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 5,
  },

  featureIconContainer: {
    width: 47,
    height: 47,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  blueFeature: {
    backgroundColor: '#DBEAFE',
  },

  yellowFeature: {
    backgroundColor: '#FEF3C7',
  },

  greenFeature: {
    backgroundColor: '#DCFCE7',
  },

  featureIcon: {
    fontSize: 22,
    fontWeight: '900',
  },

  featureTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },

  featureDescription: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 5,
  },

  securityMessage: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },

  securityIcon: {
    fontSize: 13,
    marginRight: 7,
  },

  securityText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
});