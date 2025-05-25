import { authService } from './authService';

const API_URL = 'http://192.168.1.8:8080/rest/admin-ui';
// const API_URL = 'http://172.20.10.2:8080/rest/admin-ui';
const getHeaders = async () => {
  const token = await authService.getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  return headers;
};

export const bankService = {
  // Методы для работы с пользователями
  async createUser(userData) {
    const headers = await getHeaders();
    const formattedData = {
      name: userData.firstName,
      surname: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      contactPhone: userData.phone,
      address: userData.address,
      isActive: true,
      verificationStatus: true
    };
    
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }
    return response.json();
  },

  async getUsers() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/users`, { headers });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  // Методы для работы со счетами
  async createAccount(accountData) {
    try {
      const headers = await getHeaders();
      
      // Получаем список валют
      const currenciesResponse = await fetch(`${API_URL}/currencies`, {
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Get currencies response status:', currenciesResponse.status);
      
      if (!currenciesResponse.ok) {
        const errorData = await currenciesResponse.json();
        console.error('Error response data:', errorData);
        throw new Error('Failed to fetch currencies');
      }
      
      const currenciesData = await currenciesResponse.json();
      console.log('Currencies response:', currenciesData);
      
      // Проверяем структуру ответа
      const currencies = currenciesData.content || currenciesData;
      console.log('Processed currencies:', currencies);
      
      if (!currencies || !Array.isArray(currencies) || currencies.length === 0) {
        throw new Error('No currencies available');
      }
      
      // Находим нужную валюту по ID
      const selectedCurrency = currencies.find(c => c.id === accountData.currencyId);
      if (!selectedCurrency) {
        throw new Error('Selected currency not found');
      }
      
      console.log('Using currency:', selectedCurrency);
      
      const requestData = {
        id: 0,
        type: accountData.type || 'CURRENT',
        currency: {
          id: selectedCurrency.id,
          curAbbreviation: selectedCurrency.curAbbreviation,
          curRate: selectedCurrency.curRate,
          curScale: selectedCurrency.curScale
        },
        balance: 0,
        accountStatus: true,
        credentialId: accountData.credentialId,
        lastOperationDate: new Date().toISOString()
      };
      
      console.log('Creating account with data:', requestData);
      
      const response = await fetch(`${API_URL}/bankAccounts`, {
        method: 'POST',
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('Create account response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || 'Failed to create account');
      }
      
      const responseData = await response.json();
      console.log('Create account success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in createAccount:', error);
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Не удалось подключиться к серверу. Проверьте, что сервер запущен и доступен.');
      }
      throw error;
    }
  },

  // Методы для работы с картами
  async createCard(cardData) {
    const headers = await getHeaders();
    const formattedData = {
      userId: cardData.userId,
      cardType: cardData.cardType || 'DEBIT',
      status: 'ACTIVE', // Статус карты по умолчанию
    };
    
    const response = await fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formattedData),
    });
    if (!response.ok) throw new Error('Failed to create card');
    return response.json();
  },

  // Методы для работы с логинами
  async createLogin(loginData) {
    const headers = await getHeaders();
    const formattedData = {
      email: loginData.email,
      password: loginData.password,
      user: { id: loginData.userId }
    };
    const response = await fetch(`${API_URL}/loginDetails`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formattedData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create login');
    }
    return response.json();
  },

  // Методы для работы с кредами
  async createCredential(credentialData) {
    const headers = await getHeaders();
    const formattedData = {
      userId: credentialData.userId,
      loginDetailsId: credentialData.loginDetailsId,
      roleId: credentialData.roleId || credentialData.role
    };
    console.log('Creating credential with data:', formattedData);
    const response = await fetch(`${API_URL}/credentials`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formattedData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create credential');
    }
    return response.json();
  },

  async getRoles() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/roles`, { headers });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch roles');
    }
    const data = await response.json();
    return data.content || [];
  },

  async updateCredential(credentialId, data) {
    const headers = await getHeaders();
    console.log('Updating credential with data:', { credentialId, data });
    
    const response = await fetch(`${API_URL}/credentials/${credentialId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    
    console.log('Update credential response status:', response.status);
   
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update credential');
    }
    
    const responseData = await response.json();
    console.log('Update credential success');
    return responseData;
  },

  async deleteLogin(loginId) {
    try {
      const headers = await getHeaders();
      console.log('Deleting login with ID:', loginId);
      
      const response = await fetch(`${API_URL}/loginDetails/${loginId}`, {
        method: 'DELETE',
        headers,
      });
      
      console.log('Delete login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete login');
      }
      
      // При успешном удалении не пытаемся получить JSON
      console.log('Login successfully deleted');
      return true;
    } catch (error) {
      console.error('Error in deleteLogin:', error);
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      const headers = await getHeaders();
      console.log('Deleting user with ID:', userId);
      console.log('Headers:', headers);
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers,
      });
      
      console.log('Delete user response status:', response.status);
      console.log('Delete user response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      const responseData = await response.json();
      console.log('User successfully deleted:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  },

  async deleteCredential(credentialId) {
    try {
      const headers = await getHeaders();
      console.log('Deleting credential with ID:', credentialId);
      
      const response = await fetch(`${API_URL}/credentials/${credentialId}`, {
        method: 'DELETE',
        headers,
      });
      
      console.log('Delete credential response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete credential');
      }
      
      console.log('Credential successfully deleted');
    } catch (error) {
      console.error('Error in deleteCredential:', error);
      throw error;
    }
  },

  async updateUser(userId, data) {
    try {
      const headers = await getHeaders();
      console.log('Updating user with data:', { userId, data });
      
      const formattedData = {
        name: data.firstName,
        surname: data.lastName,
        dateOfBirth: data.dateOfBirth,
        contactPhone: data.phone,
        address: data.address,
        isActive: true,
        verificationStatus: true
      };
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(formattedData),
      });
      
      console.log('Update user response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      const responseData = await response.json();
      console.log('Update user success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  },

  async updateLogin(loginId, data) {
    try {
      const headers = await getHeaders();
      console.log('Updating login with data:', { loginId, data });
      
      const response = await fetch(`${API_URL}/loginDetails/${loginId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      
      console.log('Update login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || 'Failed to update login');
      }
      
      const responseData = await response.json();
      console.log('Update login success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in updateLogin:', error);
      throw error;
    }
  },

  async getCredential(credentialId) {
    try {
      const headers = await getHeaders();
      console.log('Getting credential with ID:', credentialId);
      
      const response = await fetch(`${API_URL}/credentials/${credentialId}`, {
        method: 'GET',
        headers,
      });
      
      console.log('Get credential response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get credential');
      }
      
      const responseData = await response.json();
      console.log('Get credential success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in getCredential:', error);
      throw error;
    }
  },

  async getLogin(loginId) {
    try {
      const headers = await getHeaders();
      console.log('Getting login with ID:', loginId);
      
      const response = await fetch(`${API_URL}/loginDetails/${loginId}`, {
        method: 'GET',
        headers,
      });
      
      console.log('Get login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get login');
      }
      
      const responseData = await response.json();
      console.log('Get login success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in getLogin:', error);
      throw error;
    }
  },

  async getUser(userId) {
    try {
      const headers = await getHeaders();
      console.log('Getting user with ID:', userId);
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers,
      });
      
      console.log('Get user response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user');
      }
      
      const responseData = await response.json();
      console.log('Get user success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  },

  async updateLoginDetails(loginId, data) {
    try {
      const headers = await getHeaders();
      console.log('Updating login details with data:', { loginId, data });
      
      const response = await fetch(`${API_URL}/loginDetails/${loginId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      
      console.log('Update login details response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || 'Failed to update login details');
      }
      
      const responseData = await response.json();
      console.log('Update login details success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in updateLoginDetails:', error);
      throw error;
    }
  },

  async searchUsers(searchParams) {
    try {
      const headers = await getHeaders();
      console.log('Searching users with params:', searchParams);
      
      // Получаем всех пользователей
      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers,
      });
      
      console.log('Get users response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const responseData = await response.json();
      console.log('Get users success:', responseData);
      
      // Получаем массив пользователей
      const users = Array.isArray(responseData) ? responseData : 
                   (responseData.content && Array.isArray(responseData.content) ? responseData.content : []);
      
      // Фильтруем пользователей на клиенте
      const filteredUsers = users.filter(user => {
        const nameMatch = !searchParams.name || 
          user.name?.toLowerCase().includes(searchParams.name.toLowerCase());
        const surnameMatch = !searchParams.surname || 
          user.surname?.toLowerCase().includes(searchParams.surname.toLowerCase());
        const emailMatch = !searchParams.email || 
          user.email?.toLowerCase().includes(searchParams.email.toLowerCase());
        const phoneMatch = !searchParams.phone || 
          user.contactPhone?.toLowerCase().includes(searchParams.phone.toLowerCase());
        
        return nameMatch && surnameMatch && emailMatch && phoneMatch;
      });
      
      console.log('Filtered users:', filteredUsers);
      return filteredUsers;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  },

  async getLoginByEmail(email) {
    try {
      const headers = await getHeaders();
      console.log('Getting login by email:', email);
      
      const response = await fetch(`${API_URL}/loginDetails/email/${email}`, {
        method: 'GET',
        headers,
      });
      
      console.log('Get login by email response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get login by email');
      }
      
      const responseData = await response.json();
      console.log('Get login by email success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in getLoginByEmail:', error);
      throw error;
    }
  },

  async getCredentialByLoginId(loginId) {
    try {
      const headers = await getHeaders();
      console.log('Getting credential by login ID:', loginId);
      
      const response = await fetch(`${API_URL}/credentials/login/${loginId}`, {
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Get credential by login ID response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get credential by login ID');
      }
      
      const responseData = await response.json();
      console.log('Get credential by login ID success:', responseData);
      
      // Проверяем наличие роли
      if (!responseData.role) {
        console.warn('No role found for credential:', responseData);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error in getCredentialByLoginId:', error);
      throw error;
    }
  },

  async getAllLogins() {
    try {
      const headers = await getHeaders();
      console.log('Getting all logins');
      
      // Добавляем параметры пагинации и сортировки
      const response = await fetch(`${API_URL}/loginDetails?size=100&sort=id,desc`, {
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Get all logins response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || 'Failed to get logins');
      }
      
      const responseData = await response.json();
      console.log('Get all logins success:', responseData);
      
      // Проверяем структуру ответа и возвращаем массив логинов
      if (responseData.content && Array.isArray(responseData.content)) {
        return responseData.content;
      } else if (Array.isArray(responseData)) {
        return responseData;
      } else {
        console.error('Invalid login data format:', responseData);
        return [];
      }
    } catch (error) {
      console.error('Error in getAllLogins:', error);
      throw error;
    }
  },

  async getLoginByUserId(userId) {
    try {
      const headers = await getHeaders();
      console.log('Getting login by user ID:', userId);
      
      // Получаем все логины
      const logins = await this.getAllLogins();
      console.log('Received logins:', logins);
      
      // Ищем логин с нужным user_id
      const login = logins.find(login => {
        console.log('Checking login:', login);
        return login.user && login.user.id === userId;
      });
      
      if (!login) {
        console.log('No login found for user ID:', userId);
        throw new Error('Login not found for user');
      }
      
      console.log('Found login for user:', login);
      return login;
    } catch (error) {
      console.error('Error in getLoginByUserId:', error);
      throw error;
    }
  },

  async getCurrencies() {
    try {
      const headers = await getHeaders();
      console.log('Getting currencies');
      
      const response = await fetch(`${API_URL}/currencies`, {
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Get currencies response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get currencies');
      }
      
      const responseData = await response.json();
      console.log('Get currencies success:', responseData);
      
      if (responseData.content && Array.isArray(responseData.content)) {
        return responseData.content;
      } else if (Array.isArray(responseData)) {
        return responseData;
      } else {
        console.error('Invalid currencies data format:', responseData);
        return [];
      }
    } catch (error) {
      console.error('Error in getCurrencies:', error);
      throw error;
    }
  },

  async getAccountsByUserId(userId) {
    try {
      const headers = await getHeaders();
      console.log('Getting accounts for user ID:', userId);
      
      // Сначала получаем логин пользователя
      const login = await this.getLoginByUserId(userId);
      if (!login) {
        throw new Error('Login not found for user');
      }
      
      // Затем получаем креденшиалы
      const credential = await this.getCredentialByLoginId(login.id);
      if (!credential) {
        throw new Error('Credential not found for user');
      }
      
      // Получаем счета через креденшиалы
      const response = await fetch(`${API_URL}/bankAccounts/by-user/${userId}`, {
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Get accounts response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || 'Failed to get accounts');
      }
      
      const responseData = await response.json();
      console.log('Get accounts raw response:', responseData);
      
      if (responseData.content && Array.isArray(responseData.content)) {
        console.log('Returning content array:', responseData.content);
        return responseData.content;
      } else if (Array.isArray(responseData)) {
        console.log('Returning direct array:', responseData);
        return responseData;
      } else {
        console.error('Invalid accounts data format:', responseData);
        return [];
      }
    } catch (error) {
      console.error('Error in getAccountsByUserId:', error);
      throw error;
    }
  },

  async deleteAccountCredentialLink(accountId, credentialId) {
    try {
      const headers = await getHeaders();
      console.log('Deleting account-credential link:', { accountId, credentialId });
      
      const response = await fetch(`${API_URL}/bankAccounts/${accountId}/credentials/${credentialId}`, {
        method: 'DELETE',
        headers,
      });
      
      console.log('Delete account-credential link response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось удалить связь счета с учетными данными');
      }
      
      console.log('Account-credential link successfully deleted');
      return true;
    } catch (error) {
      console.error('Error deleting account-credential link:', error);
      throw error;
    }
  },

  async deleteAccount(accountId) {
    try {
      const headers = await getHeaders();
      console.log('Deleting account with ID:', accountId);
      
      const response = await fetch(`${API_URL}/bankAccounts/${accountId}`, {
        method: 'DELETE',
        headers,
      });
      
      console.log('Delete account response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось удалить счет');
      }
      
      console.log('Account successfully deleted');
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },
}; 