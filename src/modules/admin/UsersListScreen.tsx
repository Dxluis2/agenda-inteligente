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

import { sendPasswordResetEmail } from 'firebase/auth';

import {
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../../services/firebase/firebaseConfig';
type UserStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DELETED';

type UserRole =
  | 'admin'
  | 'teacher'
  | 'student';

type UserFilter =
  | 'all'
  | UserRole
  | 'suspended';

type User = {
  id: string;
  nombre: string;
  correo: string;
  role: UserRole;
  active: boolean;
  matricula?: string;
  status?: UserStatus;
};

type FilterOption = {
  key: UserFilter;
  label: string;
  icon: string;
  count: number;
};

export default function UsersListScreen({
  navigation,
}: any) {
  const { width } = useWindowDimensions();

  const isNarrowScreen = width < 370;

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] =
    useState<UserFilter>('all');
  const [loading, setLoading] =
    useState(false);
  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const cargarUsuarios = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const snapshot = await getDocs(
        collection(db, 'users')
      );

      const lista: User[] = [];

      snapshot.forEach(
        (documentSnapshot) => {
          const data =
            documentSnapshot.data();

          if (data.status === 'DELETED') {
            return;
          }

          lista.push({
            id: documentSnapshot.id,
            nombre:
              data.nombre || 'Sin nombre',
            correo:
              data.correo || 'Sin correo',
            role:
              data.role || 'student',
            active:
              data.active ?? true,
            matricula:
              data.matricula || '',
            status:
              data.status ||
              (data.active
                ? 'ACTIVE'
                : 'SUSPENDED'),
          });
        }
      );

      lista.sort((a, b) =>
        a.nombre.localeCompare(
          b.nombre,
          'es',
          {
            sensitivity: 'base',
          }
        )
      );

      setUsers(lista);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'No se pudieron cargar los usuarios.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'focus',
        cargarUsuarios
      );

    return unsubscribe;
  }, [navigation]);

  const confirmarSuspension = (
    user: User
  ) => {
    Alert.alert(
      'Suspender usuario',
      `¿Deseas suspender temporalmente la cuenta de ${user.nombre}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Suspender',
          style: 'destructive',
          onPress: () =>
            suspenderUsuario(user),
        },
      ]
    );
  };

  const suspenderUsuario = async (
    user: User
  ) => {
    try {
      setProcessingId(user.id);

      await updateDoc(
        doc(db, 'users', user.id),
        {
          active: false,
          status: 'SUSPENDED',
          updatedAt:
            new Date().toISOString(),
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map(
          (currentUser) =>
            currentUser.id === user.id
              ? {
                  ...currentUser,
                  active: false,
                  status: 'SUSPENDED',
                }
              : currentUser
        )
      );

      Alert.alert(
        'Usuario suspendido',
        `La cuenta de ${user.nombre} fue suspendida.`
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo suspender el usuario.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const reactivarUsuario = async (
    user: User
  ) => {
    try {
      setProcessingId(user.id);

      await updateDoc(
        doc(db, 'users', user.id),
        {
          active: true,
          status: 'ACTIVE',
          updatedAt:
            new Date().toISOString(),
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map(
          (currentUser) =>
            currentUser.id === user.id
              ? {
                  ...currentUser,
                  active: true,
                  status: 'ACTIVE',
                }
              : currentUser
        )
      );

      Alert.alert(
        'Usuario reactivado',
        `La cuenta de ${user.nombre} está activa nuevamente.`
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo reactivar el usuario.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const eliminarUsuario = (
    user: User
  ) => {
    Alert.alert(
      'Eliminar usuario',
      `¿Deseas eliminar a ${user.nombre}? Esta acción ocultará la cuenta del sistema.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(user.id);

              await updateDoc(
                doc(
                  db,
                  'users',
                  user.id
                ),
                {
                  active: false,
                  status: 'DELETED',
                  deletedAt:
                    new Date().toISOString(),
                  updatedAt:
                    new Date().toISOString(),
                }
              );

              setUsers(
                (currentUsers) =>
                  currentUsers.filter(
                    (currentUser) =>
                      currentUser.id !==
                      user.id
                  )
              );

              Alert.alert(
                'Usuario eliminado',
                `${user.nombre} fue eliminado de la lista.`
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error?.message ||
                  'No se pudo eliminar el usuario.'
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const restablecerPassword = (
    user: User
  ) => {
    const correo = user.correo
      ?.trim()
      .toLowerCase();

    if (
      !correo ||
      correo === 'sin correo'
    ) {
      Alert.alert(
        'Correo no disponible',
        'Este usuario no tiene un correo electrónico registrado.'
      );

      return;
    }

    Alert.alert(
    'Restablecer contraseña',
    `Se enviará un enlace para cambiar la contraseña de ${user.nombre}.\n\nCorreo: ${correo}`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Enviar enlace',
        onPress: async () => {
          try {
            setProcessingId(user.id);

            auth.languageCode = 'es';

            await sendPasswordResetEmail(
              auth,
              correo
            );

            Alert.alert(
              'Correo enviado',
              `Se envió el enlace de recuperación a:\n\n${correo}`
            );
          } catch (error: any) {
            console.error(
              'Error al enviar recuperación:',
              error
            );

            let message =
              'No fue posible enviar el correo de recuperación.';

            switch (error?.code) {
              case 'auth/invalid-email':
                message =
                  'El correo del usuario no es válido.';
                break;

              case 'auth/too-many-requests':
                message =
                  'Se realizaron demasiadas solicitudes. Intenta nuevamente más tarde.';
                break;

              case 'auth/network-request-failed':
                message =
                  'No hay conexión con Firebase.';
                break;

              default:
                message =
                  error?.message ||
                  message;
            }

            Alert.alert(
              'Error',
              message
            );
          } finally {
            setProcessingId(null);
          }
        },
      },
      ]
    );
  };

  const counts = useMemo(() => {
    return {
      all: users.length,

      admin: users.filter(
        (user) =>
          user.role === 'admin'
      ).length,

      teacher: users.filter(
        (user) =>
          user.role === 'teacher'
      ).length,

      student: users.filter(
        (user) =>
          user.role === 'student'
      ).length,

      suspended: users.filter(
        (user) =>
          user.status === 'SUSPENDED'
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
          key: 'admin',
          label: 'Administradores',
          icon: '🛡️',
          count: counts.admin,
        },
        {
          key: 'teacher',
          label: 'Profesores',
          icon: '👨‍🏫',
          count: counts.teacher,
        },
        {
          key: 'student',
          label: 'Alumnos',
          icon: '👨‍🎓',
          count: counts.student,
        },
        {
          key: 'suspended',
          label: 'Suspendidos',
          icon: '⏸️',
          count: counts.suspended,
        },
      ],
      [counts]
    );

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.nombre
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.correo
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.role
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.matricula
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesFilter =
        filter === 'all' ||
        user.role === filter ||
        (filter === 'suspended' &&
          user.status ===
            'SUSPENDED');

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [users, search, filter]);

  const roleText = (
    role: UserRole
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
    role: UserRole
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
    role: UserRole
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
    item: User;
  }) => {
    const isProcessing =
      processingId === item.id;

    const active =
      item.status === 'ACTIVE';

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

          <View style={styles.userMainInfo}>
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
              active
                ? styles.activeBadge
                : styles.suspendedBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                active
                  ? styles.activeDot
                  : styles.suspendedDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                active
                  ? styles.activeText
                  : styles.suspendedText,
              ]}
            >
              {active
                ? 'Activo'
                : 'Suspendido'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.informationRow}>
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

          {item.matricula ? (
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
                {item.matricula}
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.noMatriculaContainer
              }
            >
              <Text
                style={
                  styles.noMatriculaText
                }
              >
                Cuenta administrativa
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {isProcessing ? (
            <View
              style={
                styles.processingContainer
              }
            >
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />

              <Text
                style={
                  styles.processingText
                }
              >
                Procesando...
              </Text>
            </View>
          ) : (
            <>
             <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.resetButton,
                ]}
                activeOpacity={0.84}
                onPress={() =>
                  restablecerPassword(item)
                }
              >
                <Text
                  style={
                    styles.resetIcon
                  }
                >
                  🔑
                </Text>

                <Text
                  style={
                    styles.resetButtonText
                  }
                >
                  Contraseña
                </Text>
              </TouchableOpacity>
              {active ? (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.suspendButton,
                  ]}
                  activeOpacity={0.84}
                  onPress={() =>
                    confirmarSuspension(
                      item
                    )
                  }
                >
                  <Text
                    style={
                      styles.suspendIcon
                    }
                  >
                    ⏸
                  </Text>

                  <Text
                    style={
                      styles.suspendButtonText
                    }
                  >
                    Suspender
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.activateButton,
                  ]}
                  activeOpacity={0.84}
                  onPress={() =>
                    reactivarUsuario(
                      item
                    )
                  }
                >
                  <Text
                    style={
                      styles.activateIcon
                    }
                  >
                    ✓
                  </Text>

                  <Text
                    style={
                      styles.activateButtonText
                    }
                  >
                    Reactivar
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.deleteButton,
                ]}
                activeOpacity={0.84}
                onPress={() =>
                  eliminarUsuario(item)
                }
              >
                <Text
                  style={styles.deleteIcon}
                >
                  🗑
                </Text>

                <Text
                  style={
                    styles.deleteButtonText
                  }
                >
                  Eliminar
                </Text>
              </TouchableOpacity>
            </>
          )}
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
          <View style={styles.headerCircleOne} />
          <View style={styles.headerCircleTwo} />

          <View
            style={styles.headerTopRow}
          >
            <View style={styles.headerIcon}>
              <Text
                style={
                  styles.headerIconText
                }
              >
                👥
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
                Usuarios
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.refreshButton
              }
              onPress={cargarUsuarios}
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
            Consulta, filtra y administra las
            cuentas registradas en la
            plataforma.
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
                style={
                  styles.headerStatNumber
                }
              >
                {counts.teacher}
              </Text>

              <Text
                style={
                  styles.headerStatLabel
                }
              >
                Profesores
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
                style={
                  styles.headerStatNumber
                }
              >
                {counts.student}
              </Text>

              <Text
                style={
                  styles.headerStatLabel
                }
              >
                Alumnos
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
                  counts.suspended > 0 &&
                    styles.suspendedStatNumber,
                ]}
              >
                {counts.suspended}
              </Text>

              <Text
                style={
                  styles.headerStatLabel
                }
              >
                Suspendidos
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchIconBox}>
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
            Filtrar usuarios
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
              Resultados
            </Text>

            <Text
              style={
                styles.resultsSubtitle
              }
            >
              {filteredUsers.length}{' '}
              usuario
              {filteredUsers.length !== 1
                ? 's'
                : ''}{' '}
              encontrado
              {filteredUsers.length !== 1
                ? 's'
                : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.84}
            onPress={() =>
              navigation.navigate(
                'RegisterUser'
              )
            }
          >
            <Text
              style={styles.createButtonIcon}
            >
              ＋
            </Text>

            {!isNarrowScreen ? (
              <Text
                style={
                  styles.createButtonText
                }
              >
                Nuevo
              </Text>
            ) : null}
          </TouchableOpacity>
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
              onRefresh={cargarUsuarios}
              tintColor="#2563EB"
              colors={['#2563EB']}
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
                  👤
                </Text>
              </View>

              <Text
                style={styles.emptyTitle}
              >
                {loading
                  ? 'Cargando usuarios...'
                  : 'No se encontraron usuarios'}
              </Text>

              {!loading ? (
                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  Prueba cambiando los filtros o
                  escribe otro término de
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
    fontSize: 19,
    fontWeight: '900',
  },

  suspendedStatNumber: {
    color: '#FDBA74',
  },

  headerStatLabel: {
    color: '#BFDBFE',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },

  headerStatDivider: {
    width: 1,
    height: 29,
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

  createButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },

  createButtonIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 5,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '900',
  },

  userMainInfo: {
    flex: 1,
    paddingRight: 7,
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

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  suspendedBadge: {
    backgroundColor: '#FFEDD5',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  activeDot: {
    backgroundColor: '#22C55E',
  },

  suspendedDot: {
    backgroundColor: '#F97316',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },

  activeText: {
    color: '#15803D',
  },

  suspendedText: {
    color: '#C2410C',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },

  informationRow: {
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

  noMatriculaContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  noMatriculaText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },

  actions: {
    minHeight: 47,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 15,
  },

  actionButton: {
    flexGrow: 1,
    flexBasis: 100,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
  },

  resetButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  resetIcon: {
    fontSize: 13,
    marginRight: 6,
  },

  resetButtonText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '900',
  },

  suspendButton: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },

  suspendIcon: {
    color: '#EA580C',
    fontSize: 13,
    marginRight: 6,
  },

  suspendButtonText: {
    color: '#C2410C',
    fontSize: 11,
    fontWeight: '900',
  },

  activateButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },

  activateIcon: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '900',
    marginRight: 6,
  },

  activateButtonText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '900',
  },

  deleteButton: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },

  deleteIcon: {
    fontSize: 13,
    marginRight: 6,
  },

  deleteButtonText: {
    color: '#BE123C',
    fontSize: 11,
    fontWeight: '900',
  },

  processingContainer: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
  },

  processingText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 8,
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