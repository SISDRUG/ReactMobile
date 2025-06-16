// Базовый URL для API
// export const API_URL = 'http://192.168.1.8:8080/rest/admin-ui';
export const API_URL = 'http://172.20.10.2:8080/rest/admin-ui';


// Настройки для карты
export const MAP_CONFIG = {
  initialRegion: {
    latitude: 53.6778, // Координаты центра Гродно
    longitude: 23.8297,
    latitudeDelta: 0.02, // Уменьшаем масштаб для лучшего обзора
    longitudeDelta: 0.02,
  },
  defaultRadius: 5000, // радиус поиска ближайших точек в метрах
};

// Типы точек интереса
export const LOCATION_TYPES = {
  ATM: 'ATM',
  BRANCH: 'BRANCH',
  EXCHANGE: 'EXCHANGE',
};

// Цвета маркеров для разных типов точек
export const MARKER_COLORS = {
  [LOCATION_TYPES.ATM]: '#28a745',
  [LOCATION_TYPES.BRANCH]: '#007bff',
  [LOCATION_TYPES.EXCHANGE]: '#ffc107',
  DEFAULT: '#6c757d',
}; 