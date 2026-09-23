import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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

import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from '../../services/firebase/firebaseConfig';

type PendingUser = {
  id: string;
  nombre: string;
  correo: string;
  role: string;
  matricula?: string;
  completed: boolean;
};

type UserFilter =
  | 'all'
  | 'pending'
  | 'completed';

type FilterOption = {
  key: UserFilter;
  label: string;
  icon: string;
  count: number;
};

export default function PendingUsersScreen({
  navigation,
}: any) {
  const { width } = useWindowDimensions();

  const isNarrowScreen = width < 370;

  const [users, setUsers] =
    useState<PendingUser[]>([]);

  const [search, setSearch] =
    useState('');

  const [filter, setFilter] =
    useState<UserFilter>('all');

  const [loading, setLoading] =
    useState(false);

  const cargarPendientes = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const snapshot = await getDocs(
        collection(db, 'pendingUsers')
      );

      const lista: PendingUser[] = [];

      snapshot.forEach(
        (documentSnapshot) => {
          const data =
            documentSnapshot.data();

          lista.push({
            id: documentSnapshot.id,
            nombre:
              data.nombre || 'Sin nombre',
            correo:
              data.correo || 'Sin correo',
            role:
              data.role || 'student',
            matricula:
              data.matricula || '',
            completed:
              data.completed ?? false,
          });
        }
      );

      lista.sort((a, b) => {
        if (
          a.completed !== b.completed
        ) {
          return a.completed ? 1 : -1;
        }

        return a.nombre.localeCompare(
          b.nombre,
          'es',
          {
            sensitivity: 'base',
          }
        );
      });

      setUsers(lista);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'No se pudieron cargar los usuarios pendientes.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'focus',
        cargarPendientes
      );

    return unsubscribe;
  }, [navigation]);

  const counts = useMemo(() => {
    return {
      all: users.length,

      pending: users.filter(
        (user) => !user.completed
      ).length,

      completed: users.filter(
        (user) => user.completed
      ).length,
    };
  }, [users]);

  const filterOptions: FilterOption[] =
    useMemo(
      () => [
        {
          key: 'all',
          label: 'Todos',
          icon: '👥',
          count: counts.all,
        },
        {
          key: 'pending',
          label: 'Pendientes',
          icon: '⏳',
          count: counts.pending,
        },
        {
          key: 'completed',
          label: 'Activados',
          icon: '✅',
          count: counts.completed,
        },
      ],
      [counts]
    );

  const filteredUsers =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return users.filter((user) => {
        const matchesSearch =
          !normalizedSearch ||
          user.nombre
            ?.toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          user.correo
            ?.toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          user.role
            ?.toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          user.matricula
            ?.toLowerCase()
            .includes(
              normalizedSearch
            );

        const matchesFilter =
          filter === 'all' ||
          (filter === 'pending' &&
            !user.completed) ||
          (filter === 'completed' &&
            user.completed);

        return (
          matchesSearch &&
          matchesFilter
        );
      });
    }, [users, search, filter]);

  const roleText = (
    role: string
  ) => {
    if (role === 'admin') {
      return 'Administrador';
    }

    if (role === 'teacher') {
      return 'Profesor';
    }

    return 'Alumno';
  };

  const roleIcon = (
    role: string
  ) => {
    if (role === 'admin') {
      return '🛡️';
    }

    if (role === 'teacher') {
      return '👨‍🏫';
    }

    return '👨‍🎓';
  };

  const roleColors = (
    role: string
  ) => {
    if (role === 'admin') {
      return {
        background: '#F3E8FF',
        color: '#7E22CE',
      };
    }

    if (role === 'teacher') {
      return {
        background: '#DBEAFE',
        color: '#1D4ED8',
      };
    }

    return {
      background: '#DCFCE7',
      color: '#15803D',
    };
  };

  const renderUser = ({
    item,
  }: {
    item: PendingUser;
  }) => {
    const roleStyle =
      roleColors(item.role);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  roleStyle.background,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                {
                  color: roleStyle.color,
                },
              ]}
            >
              {item.nombre
                ?.charAt(0)
                .toUpperCase() || 'U'}
            </Text>
          </View>

          <View
            style={styles.userInformation}
          >
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {item.nombre}
            </Text>

            <Text
              style={styles.email}
              numberOfLines={1}
            >
              {item.correo}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.completed
                ? styles.completedBadge
                : styles.pendingBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                item.completed
                  ? styles.completedDot
                  : styles.pendingDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                item.completed
                  ? styles.completedText
                  : styles.pendingText,
              ]}
            >
              {item.completed
                ? 'Activada'
                : 'Pendiente'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View
            style={[
              styles.roleContainer,
              {
                backgroundColor:
                  roleStyle.background,
              },
            ]}
          >
            <Text style={styles.roleIcon}>
              {roleIcon(item.role)}
            </Text>

            <Text
              style={[
                styles.roleText,
                {
                  color:
                    roleStyle.color,
                },
              ]}
            >
              {roleText(item.role)}
            </Text>
          </View>

          <View
            style={
              styles.matriculaContainer
            }
          >
            <Text
              style={
                styles.matriculaLabel
              }
            >
              MATRÍCULA
            </Text>

            <Text
              style={
                styles.matriculaValue
              }
              numberOfLines={1}
            >
              {item.matricula ||
                'No aplica'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusInformation,
            item.completed
              ? styles.completedInformation
              : styles.pendingInformation,
          ]}
        >
          <View
            style={[
              styles.statusInformationIcon,
              item.completed
                ? styles.completedInformationIcon
                : styles.pendingInformationIcon,
            ]}
          >
            <Text
              style={
                styles.statusInformationEmoji
              }
            >
              {item.completed
                ? '✓'
                : '⏳'}
            </Text>
          </View>

          <View
            style={
              styles.statusInformationText
            }
          >
            <Text
              style={[
                styles.statusInformationTitle,
                item.completed
                  ? styles.completedInformationTitle
                  : styles.pendingInformationTitle,
              ]}
            >
              {item.completed
                ? 'Cuenta activada'
                : 'Pendiente de activación'}
            </Text>

            <Text
              style={
                styles.statusInformationDescription
              }
            >
              {item.completed
                ? 'El usuario completó correctamente el proceso de activación.'
                : 'El usuario todavía debe completar la activación de su cuenta.'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#172554"
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <View
            style={
              styles.headerCircleOne
            }
          />

          <View
            style={
              styles.headerCircleTwo
            }
          />

          <View
            style={styles.headerTopRow}
          >
            <View style={styles.headerIcon}>
              <Text
                style={
                  styles.headerIconText
                }
              >
                ⏳
              </Text>
            </View>

            <View
              style={
                styles.headerInformation
              }
            >
              <Text
                style={styles.headerLabel}
              >
                Administración
              </Text>

              <Text style={styles.title}>
                Activaciones
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.refreshButton
              }
              onPress={
                cargarPendientes
              }
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.refreshIcon
                  }
                >
                  ↻
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Consulta las cuentas pendientes
            y revisa cuáles ya completaron su
            proceso de activación.
          </Text>

          <View style={styles.headerStats}>
            <View
              style={
                styles.headerStatItem
              }
            >
              <Text
                style={
                  styles.headerStatNumber
                }
              >
                {counts.all}
              </Text>

              <Text
                style={
                  styles.headerStatLabel
                }
              >
                Total
              </Text>
            </View>

            <View
              style={
                styles.headerStatDivider
              }
            />

            <View
              style={
                styles.headerStatItem
              }
            >
              <Text
                style={[
                  styles.headerStatNumber,
                  counts.pending > 0 &&
                    styles.pendingHeaderNumber,
                ]}
              >
                {counts.pending}
              </Text>

              <Text
                style={
                  styles.headerStatLabel
                }
              >
                Pendientes
              </Text>
            </View>

            <View
              style={
                styles.headerStatDivider
              }
            />

            <View
              style={
                styles.headerStatItem
              }
            >
              <Text
                style={[
                  styles.headerStatNumber,
                  styles.completedHeaderNumber,
                ]}
              >
                {counts.completed}
              </Text>

              <Text
                style={
                  styles.headerStatLabel
                }
              >
                Activadas
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View
            style={styles.searchIconBox}
          >
            <Text style={styles.searchIcon}>
              ⌕
            </Text>
          </View>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre, correo o matrícula"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {search.length > 0 ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() =>
                setSearch('')
              }
            >
              <Text
                style={
                  styles.clearButtonText
                }
              >
                ×
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filtersSection}>
          <Text style={styles.filtersTitle}>
            Filtrar solicitudes
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filters
            }
          >
            {filterOptions.map(
              (option) => {
                const selected =
                  filter === option.key;

                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.chip,
                      selected &&
                        styles.chipActive,
                    ]}
                    onPress={() =>
                      setFilter(
                        option.key
                      )
                    }
                    activeOpacity={0.82}
                  >
                    <Text
                      style={
                        styles.chipIcon
                      }
                    >
                      {option.icon}
                    </Text>

                    <Text
                      style={[
                        styles.chipText,
                        selected &&
                          styles.chipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>

                    <View
                      style={[
                        styles.chipCount,
                        selected &&
                          styles.chipCountActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipCountText,
                          selected &&
                            styles.chipCountTextActive,
                        ]}
                      >
                        {option.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }
            )}
          </ScrollView>
        </View>

        <View style={styles.resultsHeader}>
          <View>
            <Text
              style={styles.resultsTitle}
            >
              Solicitudes
            </Text>

            <Text
              style={
                styles.resultsSubtitle
              }
            >
              {filteredUsers.length}{' '}
              resultado
              {filteredUsers.length !== 1
                ? 's'
                : ''}
            </Text>
          </View>

          {!isNarrowScreen &&
          counts.pending > 0 ? (
            <View
              style={
                styles.pendingSummary
              }
            >
              <View
                style={
                  styles.pendingSummaryDot
                }
              />

              <Text
                style={
                  styles.pendingSummaryText
                }
              >
                {counts.pending} por activar
              </Text>
            </View>
          ) : null}
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) =>
            item.id
          }
          renderItem={renderUser}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.list,
            filteredUsers.length === 0 &&
              styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={
                cargarPendientes
              }
              colors={['#2563EB']}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={
            <View
              style={
                styles.emptyContainer
              }
            >
              <View
                style={styles.emptyIcon}
              >
                <Text
                  style={
                    styles.emptyEmoji
                  }
                >
                  📭
                </Text>
              </View>

              <Text
                style={styles.emptyTitle}
              >
                {loading
                  ? 'Cargando solicitudes...'
                  : 'No se encontraron solicitudes'}
              </Text>

              {!loading ? (
                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  Prueba cambiando el filtro
                  seleccionado o el texto de
                  búsqueda.
                </Text>
              ) : null}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },

  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  header: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#172554',
    borderRadius: 26,
    padding: 19,
    shadowColor: '#172554',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.23,
    shadowRadius: 14,
    elevation: 7,
  },

  headerCircleOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor:
      'rgba(59,130,246,0.26)',
    top: -95,
    right: -55,
  },

  headerCircleTwo: {
    position: 'absolute',
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor:
      'rgba(99,102,241,0.18)',
    bottom: -70,
    left: -40,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.16)',
    marginRight: 12,
  },

  headerIconText: {
    fontSize: 24,
  },

  headerInformation: {
    flex: 1,
  },

  headerLabel: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '800',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 2,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.15)',
  },

  refreshIcon: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '600',
  },

  subtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
    maxWidth: 340,
  },

  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 12,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,255,255,0.10)',
  },

  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },

  headerStatNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },

  pendingHeaderNumber: {
    color: '#FDBA74',
  },

  completedHeaderNumber: {
    color: '#86EFAC',
  },

  headerStatLabel: {
    color: '#BFDBFE',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },

  headerStatDivider: {
    width: 1,
    height: 31,
    backgroundColor:
      'rgba(255,255,255,0.15)',
  },

  searchContainer: {
    minHeight: 57,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    marginTop: 17,
    paddingHorizontal: 10,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  searchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },

  searchIcon: {
    color: '#2563EB',
    fontSize: 25,
    fontWeight: '700',
    marginTop: -3,
  },

  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    paddingVertical: 14,
  },

  clearButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },

  clearButtonText: {
    color: '#64748B',
    fontSize: 23,
    marginTop: -2,
  },

  filtersSection: {
    marginTop: 18,
  },

  filtersTitle: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 10,
  },

  filters: {
    paddingRight: 14,
    gap: 8,
  },

  chip: {
    minHeight: 41,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  chipText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },

  chipTextActive: {
    color: '#FFFFFF',
  },

  chipCount: {
    minWidth: 23,
    height: 23,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    marginLeft: 7,
  },

  chipCountActive: {
    backgroundColor:
      'rgba(255,255,255,0.2)',
  },

  chipCountText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
  },

  chipCountTextActive: {
    color: '#FFFFFF',
  },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 19,
    marginBottom: 12,
  },

  resultsTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },

  resultsSubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  pendingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
  },

  pendingSummaryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F97316',
    marginRight: 6,
  },

  pendingSummaryText: {
    color: '#C2410C',
    fontSize: 10,
    fontWeight: '900',
  },

  list: {
    paddingBottom: 110,
  },

  emptyList: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 15,
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

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '900',
  },

  userInformation: {
    flex: 1,
    paddingRight: 8,
  },

  name: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
  },

  email: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },

  completedBadge: {
    backgroundColor: '#DCFCE7',
  },

  pendingBadge: {
    backgroundColor: '#FFEDD5',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  completedDot: {
    backgroundColor: '#22C55E',
  },

  pendingDot: {
    backgroundColor: '#F97316',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },

  completedText: {
    color: '#15803D',
  },

  pendingText: {
    color: '#C2410C',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },

  roleIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  roleText: {
    fontSize: 10,
    fontWeight: '900',
  },

  matriculaContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  matriculaLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
  },

  matriculaValue: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
    maxWidth: 145,
  },

  statusInformation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },

  completedInformation: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },

  pendingInformation: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },

  statusInformationIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  completedInformationIcon: {
    backgroundColor: '#DCFCE7',
  },

  pendingInformationIcon: {
    backgroundColor: '#FFEDD5',
  },

  statusInformationEmoji: {
    fontSize: 17,
    fontWeight: '900',
  },

  statusInformationText: {
    flex: 1,
  },

  statusInformationTitle: {
    fontSize: 11,
    fontWeight: '900',
  },

  completedInformationTitle: {
    color: '#15803D',
  },

  pendingInformationTitle: {
    color: '#C2410C',
  },

  statusInformationDescription: {
    color: '#64748B',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 55,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
  },

  emptyEmoji: {
    fontSize: 33,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 16,
  },

  emptyDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },
});