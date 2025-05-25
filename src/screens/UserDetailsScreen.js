import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { bankService } from '../services/bankService';
import { Ionicons } from '@expo/vector-icons';

export const UserDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadRoles();
  }, []);

  useEffect(() => {
    if (userData?.user?.id) {
      loadAccounts();
    }
  }, [userData]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userId = route.params?.user?.id;
      if (!userId) {
        throw new Error('ID пользователя не найден');
      }

      // Получаем данные пользователя
      const userDetails = await bankService.getUser(userId);
      console.log('User details:', userDetails);

      // Получаем данные логина по ID пользователя
      let loginDetails = null;
      let credentialDetails = null;
      
      try {
        loginDetails = await bankService.getLoginByUserId(userId);
        console.log('Login details:', loginDetails);
        
        if (loginDetails) {
          credentialDetails = await bankService.getCredentialByLoginId(loginDetails.id);
          console.log('Credential details:', credentialDetails);
        }
      } catch (error) {
        console.log('Login or credential not found:', error);
      }

      const fullData = {
        user: {
          id: userDetails.id,
          firstName: userDetails.name,
          lastName: userDetails.surname,
          dateOfBirth: userDetails.dateOfBirth,
          phone: userDetails.contactPhone,
          address: userDetails.address,
          email: loginDetails?.email || ''
        },
        login: loginDetails ? {
          id: loginDetails.id,
          email: loginDetails.email
        } : null,
        credential: credentialDetails ? {
          id: credentialDetails.id,
          roleId: credentialDetails.role?.id,
          roleName: credentialDetails.role?.role
        } : null
      };

      console.log('Full user data:', fullData);
      setUserData(fullData);
      setEditedData(fullData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные пользователя');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const rolesList = await bankService.getRoles();
      if (Array.isArray(rolesList)) {
        setRoles(rolesList);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true);
      console.log('Loading accounts for user:', userData.user.id);
      const accountsData = await bankService.getAccountsByUserId(userData.user.id);
      console.log('Loaded accounts:', accountsData);
      if (Array.isArray(accountsData)) {
        setAccounts(accountsData);
      } else {
        console.error('Invalid accounts data format:', accountsData);
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить счета пользователя');
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleFieldChange = (field, section, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleEditUser = () => {
    setIsEditing(true);
    setEditedData({
      user: {
        id: userData.user.id,
        firstName: userData.user.firstName,
        lastName: userData.user.lastName,
        dateOfBirth: userData.user.dateOfBirth,
        phone: userData.user.phone,
        address: userData.user.address
      }
    });
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      await bankService.updateUser(editedData.user.id, editedData.user);
      await loadUserData(); // Перезагружаем данные после сохранения
      setIsEditing(false);
      Alert.alert('Успех', 'Данные успешно обновлены');
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось сохранить изменения');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  const handleDeleteUser = async () => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить этого пользователя?',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Проверяем наличие ID логина
              if (!userData.login?.id) {
                throw new Error('ID логина не найден');
              }

              console.log('Attempting to delete user with ID:', userData.user.id);
              
              // Сначала удаляем все банковские счета пользователя
              if (accounts && accounts.length > 0) {
                console.log('Deleting user accounts...');
                for (const account of accounts) {
                  try {
                    await bankService.deleteAccount(account.id);
                    console.log(`Account ${account.id} deleted successfully`);
                  } catch (error) {
                    console.error(`Error deleting account ${account.id}:`, error);
                    // Продолжаем удаление даже если один счет не удалось удалить
                  }
                }
              }

              // Затем удаляем логин, остальное обработается на бэкенде
              console.log('Deleting login with ID:', userData.login.id);
              await bankService.deleteLogin(userData.login.id);
              console.log('Login successfully deleted');
              
              Alert.alert('Успех', 'Пользователь успешно удален');
              navigation.goBack();
            } catch (error) {
              console.error('Error in handleDeleteUser:', error);
              Alert.alert('Ошибка', error.message || 'Не удалось удалить пользователя');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCreateAccount = async (userId) => {
    navigation.navigate('CreateAccount', { userId, credentialId: userData.credential?.id });
  };

  const handleCreateCard = async (userId) => {
    try {
      setLoading(true);
      const cardData = {
        userId,
        cardType: 'DEBIT',
      };
      await bankService.createCard(cardData);
      Alert.alert('Успех', 'Карта успешно создана');
      loadUserData(); // Перезагружаем данные пользователя
    } catch (error) {
      console.error('Error creating card:', error);
      Alert.alert('Ошибка', 'Не удалось создать карту');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const getAccountTypeText = (type) => {
    switch (type) {
      case 'CURRENT':
        return 'Текущий';
      case 'SAVINGS':
        return 'Сберегательный';
      default:
        return type;
    }
  };

  const getAccountStatusText = (status) => {
    return status ? 'Активен' : 'Заблокирован';
  };

  if (loading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Данные пользователя не найдены</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {userData?.user?.firstName} {userData?.user?.lastName}
          </Text>
          <Text style={styles.subHeaderText}>
            ID: {userData?.user?.id}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основная информация</Text>
          {isEditing ? (
            <>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Имя:</Text>
                <TextInput
                  style={styles.input}
                  value={editedData.user.firstName}
                  onChangeText={(text) => setEditedData(prev => ({
                    ...prev,
                    user: { ...prev.user, firstName: text }
                  }))}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Фамилия:</Text>
                <TextInput
                  style={styles.input}
                  value={editedData.user.lastName}
                  onChangeText={(text) => setEditedData(prev => ({
                    ...prev,
                    user: { ...prev.user, lastName: text }
                  }))}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Дата рождения:</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>
                    {editedData.user.dateOfBirth ? new Date(editedData.user.dateOfBirth).toLocaleDateString() : 'Выберите дату'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={editedData.user.dateOfBirth ? new Date(editedData.user.dateOfBirth) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setEditedData(prev => ({
                          ...prev,
                          user: { ...prev.user, dateOfBirth: selectedDate.toISOString() }
                        }));
                      }
                    }}
                  />
                )}
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Телефон:</Text>
                <TextInput
                  style={styles.input}
                  value={editedData.user.phone}
                  onChangeText={(text) => setEditedData(prev => ({
                    ...prev,
                    user: { ...prev.user, phone: text }
                  }))}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Адрес:</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={editedData.user.address}
                  onChangeText={(text) => setEditedData(prev => ({
                    ...prev,
                    user: { ...prev.user, address: text }
                  }))}
                  multiline
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Имя:</Text>
                <Text style={styles.value}>{userData?.user?.firstName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Фамилия:</Text>
                <Text style={styles.value}>{userData?.user?.lastName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Дата рождения:</Text>
                <Text style={styles.value}>
                  {userData?.user?.dateOfBirth ? new Date(userData.user.dateOfBirth).toLocaleDateString() : 'Не указана'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Телефон:</Text>
                <Text style={styles.value}>{userData?.user?.phone || 'Не указан'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Адрес:</Text>
                <Text style={styles.value}>{userData?.user?.address || 'Не указан'}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Счета</Text>
          {accountsLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : accounts.length > 0 ? (
            accounts.map((account) => (
              <View key={account.id} style={styles.accountCard}>
                <View style={styles.accountHeader}>
                  <Text style={styles.accountType}>{getAccountTypeText(account.type)}</Text>
                  <Text style={[
                    styles.accountStatus,
                    { color: account.accountStatus ? '#34C759' : '#FF3B30' }
                  ]}>
                    {getAccountStatusText(account.accountStatus)}
                  </Text>
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountBalance}>
                    {account.balance} {account.currency?.curAbbreviation || ''}
                  </Text>
                  <Text style={styles.accountDate}>
                    Создан: {formatDate(account.dateOfCreation)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noAccounts}>У пользователя нет счетов</Text>
          )}
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => handleCreateAccount(userData.user.id)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.createAccountText}>Создать новый счет</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Учетные данные</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userData?.login?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Роль:</Text>
            <Text style={styles.value}>{userData?.credential?.roleName}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        {isEditing ? (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSaveChanges}
            >
              <Text style={styles.buttonText}>Сохранить</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancelEdit}
            >
              <Text style={styles.buttonText}>Отмена</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.editButton]} 
              onPress={handleEditUser}
            >
              <Text style={styles.buttonText}>Редактировать</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={handleDeleteUser}
            >
              <Text style={styles.buttonText}>Удалить</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#007AFF',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#007AFF',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  accountCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accountType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  accountStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountDetails: {
    marginTop: 4,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  accountDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  noAccounts: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
    marginVertical: 16,
  },
  createAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginTop: 8,
  },
  createAccountText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
}); 