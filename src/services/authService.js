import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYCLOAK_URL = 'http://192.168.1.8:9080';
// const KEYCLOAK_URL = 'http://172.20.10.2:9080';
const REALM = 'master';
const CLIENT_ID = 'bank-app';

export const authService = {
  async login(username, password) {
    try {
      const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
      console.log('Attempting login to:', tokenUrl);
      
      const formData = new FormData();
      formData.append('grant_type', 'password');
      formData.append('client_id', CLIENT_ID);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('scope', 'openid profile email');

      console.log('Request params:', formData);
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=password&client_id=${CLIENT_ID}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&scope=openid+profile+email`,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Login failed with status:', response.status);
        console.error('Error response:', errorData);
        throw new Error(`Login failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Login successful, received tokens');
      
      await AsyncStorage.setItem('accessToken', data.access_token);
      await AsyncStorage.setItem('refreshToken', data.refresh_token);
      await AsyncStorage.setItem('tokenExpiresIn', data.expires_in.toString());
      await AsyncStorage.setItem('tokenTimestamp', Date.now().toString());
      return data;
    } catch (error) {
      console.error('Login error details:', error);
      throw error;
    }
  },

  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=refresh_token&client_id=${CLIENT_ID}&refresh_token=${refreshToken}`,
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      await AsyncStorage.setItem('accessToken', data.access_token);
      await AsyncStorage.setItem('refreshToken', data.refresh_token);
      await AsyncStorage.setItem('tokenExpiresIn', data.expires_in.toString());
      await AsyncStorage.setItem('tokenTimestamp', Date.now().toString());
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        const logoutUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`;
        await fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `client_id=${CLIENT_ID}&refresh_token=${refreshToken}`,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('tokenExpiresIn');
      await AsyncStorage.removeItem('tokenTimestamp');
    }
  },

  async getAccessToken() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const expiresIn = await AsyncStorage.getItem('tokenExpiresIn');
      const timestamp = await AsyncStorage.getItem('tokenTimestamp');

      if (!token || !expiresIn || !timestamp) {
        return null;
      }

      const now = Date.now();
      const tokenAge = now - parseInt(timestamp);
      const expiresInMs = parseInt(expiresIn) * 1000;

      if (tokenAge > expiresInMs - 30000) {
        await this.refreshToken();
        return await AsyncStorage.getItem('accessToken');
      }

      return token;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  },

  async isAuthenticated() {
    const token = await this.getAccessToken();
    return !!token;
  },
}; 