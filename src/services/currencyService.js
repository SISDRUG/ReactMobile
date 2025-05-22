import { authService } from './authService';

// const API_URL = 'http://192.168.1.8:8080/rest/admin-ui'; // Используем базовый URL бэкенда
const API_URL = 'http://172.20.10.2:8080/rest/admin-ui';
export const currencyService = {
  async getCurrencyRates() {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      // Актуальный эндпоинт для получения курсов валют
      const endpoint = '/currencies?page=0&size=20';
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || `Failed to fetch currency rates: ${response.status}`);
      }

      const data = await response.json();
      // Ожидаем формат данных, как в вашем bankService.getAccounts (с полем content)
      // data.content должен быть массивом объектов валют
      if (data && Array.isArray(data.content)) {
         // Преобразуем список валют в формат rates: { USD: rate, EUR: rate, ... }
         const rates = {};
         data.content.forEach(currency => {
            if (currency.curAbbreviation && currency.curRate) {
                // Убедитесь, что ваш бэкенд возвращает курс относительно базовой валюты (RUB)
                // Если базовая валюта не RUB, может потребоваться дополнительный расчет
                rates[currency.curAbbreviation] = currency.curRate;
            }
         });
         // Добавляем RUB с курсом 1 к самому себе, если он не пришел с бэкенда
         if (!rates['RUB']) {
             rates['RUB'] = 1;
         }
         return { rates: rates };
      } else {
         throw new Error('Invalid currency rates data format from backend');
      }

    } catch (error) {
      console.error('Error fetching currency rates:', error);
      throw error;
    }
  },
}; 