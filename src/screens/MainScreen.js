import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { bankService } from '../services/bankService';
import { currencyService } from '../services/currencyService';
import { locationService } from '../services/locationService';
import { useAuth } from '../context/AuthContext';
import CardSlider from '../components/CardSlider';
import { MAP_CONFIG, LOCATION_TYPES, MARKER_COLORS } from '../config';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SPACING = width * 0.05;

const DEFAULT_MAP_REGION = {
  latitude: 53.90454,
  longitude: 27.561524,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Разрешение на использование геолокации",
          message: "Приложению требуется доступ к вашей геолокации для отображения ближайших точек",
          buttonNeutral: "Спросить позже",
          buttonNegative: "Отмена",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Разрешение на геолокацию получено");
        return true;
      } else {
        console.log("Разрешение на геолокацию отклонено");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    // Для iOS используем существующий код
    let { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }
};

export const MainScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([]);
  const [currencyRates, setCurrencyRates] = useState(null);
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(DEFAULT_MAP_REGION);
  const { logout } = useAuth();
  const onLogout = route.params?.onLogout;
  const [cardsData, setCardsData] = useState(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingCurrency, setLoadingCurrency] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [selectedLocationType, setSelectedLocationType] = useState('ALL');
  const [loadingLocations, setLoadingLocations] = useState(false);

  const formatCardNumber = (number) => {
    if (!number) return 'N/A';
    const numStr = number.toString();
    return `**** **** **** ${numStr.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (balance === undefined || balance === null) return 'N/A';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(balance);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cardsData, currencyRatesData] = await Promise.all([
        bankService.getCards(),
        currencyService.getCurrencyRates(),
      ]);

      const fetchedCards = Array.isArray(cardsData?.content) ? cardsData.content : [];
      setCards([...fetchedCards, { id: 'create-card', isPlaceholder: true }]);

      if (currencyRatesData && currencyRatesData.rates) {
        setCurrencyRates(currencyRatesData.rates);
      } else {
        setError('Неверный формат данных о курсах валют');
      }

      console.log('Cards data:', cardsData);
      console.log('Currency Rates data:', currencyRatesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyLocations = async (latitude, longitude) => {
    try {
      setLoadingLocations(true);
      // Временно используем моковые данные
      const locations = locationService.getMockLocations();
      setNearbyLocations(locations);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить ближайшие точки');
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchLocation = async () => {
    try {
      setLoadingLocation(true);
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        setErrorMsg('Для работы с картой необходимо разрешить доступ к геолокации');
        setLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });
      
      setLocation(location.coords);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      
      // Загружаем ближайшие точки после получения местоположения
      await fetchNearbyLocations(location.coords.latitude, location.coords.longitude);
      
      setLoadingLocation(false);
    } catch (error) {
      console.error("Error fetching location:", error);
      setErrorMsg("Ошибка получения местоположения");
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchLocation();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Ошибка', 'Не удалось выйти из системы');
    }
  };

  const navigateToCurrencyCalculator = () => {
    navigation.navigate('Калькулятор');
  };

  const getMarkerColor = (type) => {
    return MARKER_COLORS[type] || MARKER_COLORS.DEFAULT;
  };

  const filteredLocations = useMemo(() => {
    return selectedLocationType === 'ALL'
      ? nearbyLocations
      : nearbyLocations.filter(loc => loc.type === selectedLocationType);
  }, [selectedLocationType, nearbyLocations]);

  const getMarkerIcon = (type) => {
    switch (type) {
      case LOCATION_TYPES.ATM:
        return { name: 'cash', size: 30, color: '#fff' };
      case LOCATION_TYPES.BRANCH:
        return { name: 'bank', size: 30, color: '#fff' };
      case LOCATION_TYPES.EXCHANGE:
        return { name: 'currency-usd', size: 30, color: '#fff' };
      default:
        return { name: 'map-marker', size: 30, color: '#fff' };
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error && (!cards || cards.length === 0) && !currencyRates) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => { loadData(); }}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availableCurrencies = currencyRates ? Object.keys(currencyRates) : [];
  if (!availableCurrencies.includes('BYN')) {
    availableCurrencies.unshift('BYN');
  }
  availableCurrencies.sort();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>FinBix</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutButton}>Выйти</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Карты</Text>
        <CardSlider 
          cards={cards} 
          onCardPress={(card) => {
            if (card.isPlaceholder) {
              Alert.alert('Создание карты', 'Переход на экран создания карты');
            } else {
              // Handle card press
              console.log('Card pressed:', card);
            }
          }}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Курсы валют</Text>
          {currencyRates ? (
            Object.entries(currencyRates).map(([currency, rate]) => (
              <Text key={currency} style={styles.currencyRate}>
                1 {currency} = {formatBalance(rate).replace('₽', '')} BYN
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>Загрузка курсов...</Text>
          )}
          <TouchableOpacity onPress={navigateToCurrencyCalculator} style={styles.currencyCalculatorButton}>
            <Text style={styles.currencyCalculatorButtonText}>Калькулятор валют</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>Ближайшие точки</Text>
          
          {/* Фильтры типов точек */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedLocationType === 'ALL' && styles.filterButtonActive
              ]}
              onPress={() => setSelectedLocationType('ALL')}
            >
              <Text style={styles.filterButtonText}>Все</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedLocationType === LOCATION_TYPES.ATM && styles.filterButtonActive
              ]}
              onPress={() => setSelectedLocationType(LOCATION_TYPES.ATM)}
            >
              <Text style={styles.filterButtonText}>Банкоматы</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedLocationType === LOCATION_TYPES.BRANCH && styles.filterButtonActive
              ]}
              onPress={() => setSelectedLocationType(LOCATION_TYPES.BRANCH)}
            >
              <Text style={styles.filterButtonText}>Отделения</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedLocationType === LOCATION_TYPES.EXCHANGE && styles.filterButtonActive
              ]}
              onPress={() => setSelectedLocationType(LOCATION_TYPES.EXCHANGE)}
            >
              <Text style={styles.filterButtonText}>Обменники</Text>
            </TouchableOpacity>
          </ScrollView>

          {loadingLocation ? (
            <View style={styles.mapLoadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.mapLoadingText}>Загрузка карты...</Text>
            </View>
          ) : errorMsg ? (
            <View style={styles.mapErrorContainer}>
              <Text style={styles.mapErrorText}>{errorMsg}</Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {filteredLocations.map((loc, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                  }}
                  title={loc.name}
                  description={loc.address}
                >
                  <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(loc.type) }]}>
                    <MaterialCommunityIcons
                      name={getMarkerIcon(loc.type).name}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{loc.name}</Text>
                      <Text style={styles.calloutAddress}>{loc.address}</Text>
                      <Text style={styles.calloutType}>{loc.type}</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  cardSlider: {
    paddingHorizontal: SPACING,
  },
  card: {
    width: CARD_WIDTH,
    height: 200,
    backgroundColor: '#28a745',
    borderRadius: 15,
    padding: 20,
    marginRight: SPACING,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  emptyCard: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  cardBalance: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardHolder: {
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.5,
  },
  createCardButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  currencyRate: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  currencyCalculatorButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  currencyCalculatorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    fontSize: 16,
  },
  errorText: {
    color: '#ff3b30',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 400,
  },
  mapLoadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: {
    marginTop: 10,
    color: '#666',
    fontStyle: 'italic',
    fontSize: 16,
  },
  mapErrorContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapErrorText: {
    color: '#ff3b30',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  calloutContainer: {
    padding: 12,
    minWidth: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    minWidth: 120,
  },
  calloutAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
    minWidth: 120,
  },
  calloutType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
    minWidth: 120,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  markerContainer: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default MainScreen; 