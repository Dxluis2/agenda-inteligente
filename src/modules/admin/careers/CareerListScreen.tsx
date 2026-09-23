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
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  CareerService,
} from '../../../services/career/CareerService';

import { Career } from '../../../types';

export default function CareerListScreen({
  navigation,
}: any) {
  const { width } = useWindowDimensions();

  const isNarrowScreen = width < 370;

  const [careers, setCareers] =
    useState<Career[]>([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const cargarCarreras = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await CareerService.getAllCareers();

      const activeCareers = data
        .filter(
          (career) =>
            career.active !== false
        )
        .sort((a, b) =>
          a.nombre.localeCompare(
            b.nombre,
            'es',
            {
              sensitivity: 'base',
            }
          )
        );

      setCareers(activeCareers);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'No se pudieron cargar las carreras.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'focus',
        cargarCarreras
      );

    return unsubscribe;
  }, [navigation]);

  const eliminarCarrera = (
    career: Career
  ) => {
    Alert.alert(
      'Eliminar carrera',
      `¿Seguro que deseas eliminar la carrera "${career.nombre}"?`,
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
              setProcessingId(
                career.id
              );

              await CareerService.deleteCareer(
                career.id
              );

              setCareers(
                (currentCareers) =>
                  currentCareers.filter(
                    (currentCareer) =>
                      currentCareer.id !==
                      career.id
                  )
              );

              Alert.alert(
                'Carrera eliminada',
                'La carrera fue eliminada correctamente.'
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error?.message ||
                  'No se pudo eliminar la carrera.'
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredCareers =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return careers.filter(
        (career) => {
          return (
            !normalizedSearch ||
            career.nombre
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            career.descripcion
              ?.toLowerCase()
              .includes(
                normalizedSearch
              )
          );
        }
      );
    }, [careers, search]);

  const getCareerIcon = (
    name: string
  ) => {
    const normalized =
      name.toLowerCase();

    if (
      normalized.includes(
        'sistema'
      ) ||
      normalized.includes(
        'software'
      ) ||
      normalized.includes(
        'informática'
      )
    ) {
      return '💻';
    }

    if (
      normalized.includes(
        'mecatrónica'
      ) ||
      normalized.includes(
        'robot'
      )
    ) {
      return '🤖';
    }

    if (
      normalized.includes(
        'electrónica'
      ) ||
      normalized.includes(
        'eléctrica'
      )
    ) {
      return '⚡';
    }

    if (
      normalized.includes(
        'administración'
      ) ||
      normalized.includes(
        'negocios'
      )
    ) {
      return '📊';
    }

    if (
      normalized.includes(
        'contabilidad'
      ) ||
      normalized.includes(
        'finanzas'
      )
    ) {
      return '💰';
    }

    if (
      normalized.includes(
        'industrial'
      )
    ) {
      return '🏭';
    }

    if (
      normalized.includes(
        'arquitectura'
      ) ||
      normalized.includes(
        'civil'
      )
    ) {
      return '🏗️';
    }

    if (
      normalized.includes(
        'diseño'
      )
    ) {
      return '🎨';
    }

    if (
      normalized.includes(
        'turismo'
      )
    ) {
      return '✈️';
    }

    if (
      normalized.includes(
        'gastronomía'
      )
    ) {
      return '🍽️';
    }

    if (
      normalized.includes(
        'psicología'
      )
    ) {
      return '🧠';
    }

    return '🎓';
  };

  const renderCareer = ({
    item,
  }: {
    item: Career;
  }) => {
    const isProcessing =
      processingId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() =>
            navigation.navigate(
              'AdminSubjectList',
              {
                career: item,
              }
            )
          }
          disabled={isProcessing}
        >
          <View
            style={styles.cardHeader}
          >
            <View
              style={styles.iconBox}
            >
              <Text
                style={
                  styles.iconEmoji
                }
              >
                {getCareerIcon(
                  item.nombre
                )}
              </Text>
            </View>

            <View
              style={
                styles.information
              }
            >
              <Text
                style={
                  styles.careerName
                }
                numberOfLines={2}
              >
                {item.nombre}
              </Text>

              <Text
                style={
                  styles.description
                }
                numberOfLines={2}
              >
                {item.descripcion ||
                  'Sin descripción registrada'}
              </Text>
            </View>

            <View
              style={
                styles.arrowContainer
              }
            >
              <Text
                style={styles.arrow}
              >
                ›
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

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
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.editButton,
              ]}
              activeOpacity={0.84}
              onPress={() =>
                navigation.navigate(
                  'EditCareer',
                  {
                    career: item,
                  }
                )
              }
            >
              <Text
                style={
                  styles.editIcon
                }
              >
                ✏️
              </Text>

              <Text
                style={
                  styles.editButtonText
                }
              >
                Editar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.deleteButton,
              ]}
              activeOpacity={0.84}
              onPress={() =>
                eliminarCarrera(item)
              }
            >
              <Text
                style={
                  styles.deleteIcon
                }
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
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
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
            <View
              style={styles.headerIcon}
            >
              <Text
                style={
                  styles.headerIconText
                }
              >
                🎓
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
                Administración académica
              </Text>

              <Text style={styles.title}>
                Carreras
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.refreshButton
              }
              activeOpacity={0.8}
              onPress={cargarCarreras}
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
                    styles.refreshIcon
                  }
                >
                  ↻
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Administra las carreras
            registradas y accede a sus
            asignaturas.
          </Text>

          <View
            style={
              styles.headerSummary
            }
          >
            <View
              style={
                styles.headerSummaryIcon
              }
            >
              <Text
                style={
                  styles.headerSummaryEmoji
                }
              >
                📚
              </Text>
            </View>

            <View
              style={
                styles.headerSummaryInformation
              }
            >
              <Text
                style={
                  styles.headerSummaryLabel
                }
              >
                Carreras activas
              </Text>

              <Text
                style={
                  styles.headerSummaryDescription
                }
              >
                Oferta académica disponible
              </Text>
            </View>

            <Text
              style={
                styles.headerSummaryNumber
              }
            >
              {careers.length}
            </Text>
          </View>
        </View>

        <View
          style={styles.searchContainer}
        >
          <View
            style={styles.searchIconBox}
          >
            <Text
              style={styles.searchIcon}
            >
              ⌕
            </Text>
          </View>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar carrera"
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

        <View
          style={styles.resultsHeader}
        >
          <View>
            <Text
              style={styles.resultsTitle}
            >
              Carreras registradas
            </Text>

            <Text
              style={
                styles.resultsSubtitle
              }
            >
              {filteredCareers.length}{' '}
              resultado
              {filteredCareers.length !== 1
                ? 's'
                : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.createButton
            }
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                'CreateCareer'
              )
            }
          >
            <Text
              style={
                styles.createButtonIcon
              }
            >
              +
            </Text>

            {!isNarrowScreen ? (
              <Text
                style={
                  styles.createButtonText
                }
              >
                Nueva carrera
              </Text>
            ) : null}
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredCareers}
          keyExtractor={(item) =>
            item.id
          }
          renderItem={renderCareer}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.list,
            filteredCareers.length ===
              0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={
                cargarCarreras
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
                  🎓
                </Text>
              </View>

              <Text
                style={styles.emptyTitle}
              >
                {loading
                  ? 'Cargando carreras...'
                  : search
                  ? 'No se encontraron carreras'
                  : 'No hay carreras registradas'}
              </Text>

              {!loading ? (
                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  {search
                    ? 'Prueba escribiendo otro término de búsqueda.'
                    : 'Crea la primera carrera para comenzar a organizar la oferta académica.'}
                </Text>
              ) : null}

              {!loading &&
              !search ? (
                <TouchableOpacity
                  style={
                    styles.emptyButton
                  }
                  activeOpacity={0.84}
                  onPress={() =>
                    navigation.navigate(
                      'CreateCareer'
                    )
                  }
                >
                  <Text
                    style={
                      styles.emptyButtonText
                    }
                  >
                    Crear carrera
                  </Text>
                </TouchableOpacity>
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

  headerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 12,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,255,255,0.10)',
  },

  headerSummaryIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.15)',
    marginRight: 10,
  },

  headerSummaryEmoji: {
    fontSize: 19,
  },

  headerSummaryInformation: {
    flex: 1,
  },

  headerSummaryLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  headerSummaryDescription: {
    color: '#BFDBFE',
    fontSize: 9,
    marginTop: 3,
  },

  headerSummaryNumber: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    marginLeft: 8,
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
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },

  createButtonIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
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

  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    marginRight: 13,
  },

  iconEmoji: {
    fontSize: 25,
  },

  information: {
    flex: 1,
    paddingRight: 8,
  },

  careerName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },

  description: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },

  arrow: {
    color: '#2563EB',
    fontSize: 25,
    marginTop: -3,
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },

  actions: {
    flexDirection: 'row',
    gap: 9,
  },

  actionButton: {
    flex: 1,
    minHeight: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
  },

  editButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  editIcon: {
    fontSize: 13,
    marginRight: 6,
  },

  editButtonText: {
    color: '#1D4ED8',
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
    minHeight: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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

  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});