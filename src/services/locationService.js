import { API_URL, MAP_CONFIG, LOCATION_TYPES } from '../config';

class LocationService {
  async getNearbyLocations(latitude, longitude, radius = MAP_CONFIG.defaultRadius) {
    try {
      // TODO: Заменить на реальный эндпоинт бэкенда
      const response = await fetch(`${API_URL}/locations/nearby?lat=${latitude}&lon=${longitude}&radius=${radius}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby locations');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      throw error;
    }
  }

  // Временные тестовые данные для Гродно
  getMockLocations() {
    return [
      // Центр города
      {
        id: 'atm1',
        type: LOCATION_TYPES.ATM,
        name: 'Банкомат БПС-Сбербанк',
        latitude: 53.67905,
        longitude: 23.82983,
        address: 'ул. Советская, 1',
        workingHours: '24/7',
      },
      {
        id: 'branch1',
        type: LOCATION_TYPES.BRANCH,
        name: 'Отделение Беларусбанк',
        latitude: 53.68094,
        longitude: 23.8292,
        address: 'ул. Советская, 8',
        workingHours: '9:00-18:00',
      },
      // Район Южный
      {
        id: 'atm2',
        type: LOCATION_TYPES.ATM,
        name: 'Банкомат Белинвестбанк',
        latitude: 53.6623,
        longitude: 23.8412,
        address: 'ул. Болдина, 15',
        workingHours: '24/7',
      },
      {
        id: 'exchange1',
        type: LOCATION_TYPES.EXCHANGE,
        name: 'Обменный пункт №1',
        latitude: 53.6635,
        longitude: 23.8420,
        address: 'ул. Болдина, 25',
        workingHours: '10:00-20:00',
      },
      // Район Девятовка
      {
        id: 'branch2',
        type: LOCATION_TYPES.BRANCH,
        name: 'Отделение БПС-Сбербанк',
        latitude: 53.6920,
        longitude: 23.8150,
        address: 'ул. Девятовка, 10',
        workingHours: '9:00-18:00',
      },
      {
        id: 'atm3',
        type: LOCATION_TYPES.ATM,
        name: 'Банкомат Беларусбанк',
        latitude: 53.6932,
        longitude: 23.8165,
        address: 'ул. Девятовка, 15',
        workingHours: '24/7',
      },
      // Район Ольшанка
      {
        id: 'exchange2',
        type: LOCATION_TYPES.EXCHANGE,
        name: 'Обменный пункт №2',
        latitude: 53.7025,
        longitude: 23.7942,
        address: 'ул. Ольшанка, 5',
        workingHours: '10:00-20:00',
      },
      {
        id: 'branch3',
        type: LOCATION_TYPES.BRANCH,
        name: 'Отделение Белинвестбанк',
        latitude: 53.7038,
        longitude: 23.7958,
        address: 'ул. Ольшанка, 12',
        workingHours: '9:00-18:00',
      },
      // Район Пышки
      {
        id: 'exchange3',
        type: LOCATION_TYPES.EXCHANGE,
        name: 'Обменный пункт №3',
        latitude: 53.6840,
        longitude: 23.8658,
        address: 'ул. Пышки, 8',
        workingHours: '10:00-20:00',
      },
      {
        id: 'atm4',
        type: LOCATION_TYPES.ATM,
        name: 'Банкомат БПС-Сбербанк',
        latitude: 53.6852,
        longitude: 23.8670,
        address: 'ул. Пышки, 15',
        workingHours: '24/7',
      },
    ];
  }
}

export const locationService = new LocationService(); 