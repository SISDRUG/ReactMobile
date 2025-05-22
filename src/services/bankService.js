import { authService } from './authService';

// const API_URL = 'http://192.168.1.8:8080/rest/admin-ui';
const API_URL = 'http://172.20.10.2:8080/rest/admin-ui';
const getHeaders = async () => {
  const token = await authService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const bankService = {
  async getCards() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/cards`, { headers });
    if (!response.ok) throw new Error('Failed to fetch cards');
    return response.json();
  },

  async getAccounts() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/bankAccounts`, { headers });
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  },

  async getOperations() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/operations`, { headers });
    if (!response.ok) throw new Error('Failed to fetch operations');
    return response.json();
  },

  async createOperation(operationData) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/operations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(operationData),
    });
    if (!response.ok) throw new Error('Failed to create operation');
    return response.json();
  },

  async getCurrencies() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/currencies`, { headers });
    if (!response.ok) throw new Error('Failed to fetch currencies');
    return response.json();
  },
}; 