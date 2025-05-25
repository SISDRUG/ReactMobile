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
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { bankService } from '../services/bankService';

const ROLES = [
  { label: 'Сотрудник', value: 'EMPLOYEE' },
  { label: 'Клиент', value: 'CLIENT' },
  { label: 'Админ', value: 'ADMIN' },
];

export const UserManagementScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [step, setStep] = useState(1);
  const [createdUser, setCreatedUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});
  const [credentialData, setCredentialData] = useState({ role: '' });
  const [credentialErrors, setCredentialErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [changedFields, setChangedFields] = useState({
    user: {},
    login: {},
    credential: {}
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUsers();
      resetForm();
    });

    return unsubscribe;
  }, [navigation]);

  const loadRoles = async () => {
    try {
      console.log('Loading roles...');
      const rolesList = await bankService.getRoles();
      console.log('Received roles:', rolesList);
      if (Array.isArray(rolesList) && rolesList.length > 0) {
        setRoles(rolesList);
        setCredentialData(prev => ({ ...prev, role: rolesList[0].id }));
      } else {
        console.error('Invalid roles data format:', rolesList);
        Alert.alert('Ошибка', 'Не удалось загрузить список ролей');
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список ролей');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newUser.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }
    if (!newUser.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }
    if (!newUser.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Дата рождения обязательна';
    } else {
      // Проверка формата даты YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(newUser.dateOfBirth)) {
        newErrors.dateOfBirth = 'Неверный формат даты (YYYY-MM-DD)';
      }
    }
    if (!newUser.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    }
    if (!newUser.address.trim()) {
      newErrors.address = 'Адрес обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setNewUser({ ...newUser, dateOfBirth: formattedDate });
      setSelectedDate(selectedDate);
      if (errors.dateOfBirth) {
        setErrors({ ...errors, dateOfBirth: null });
      }
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersList = await bankService.getUsers();
      console.log('Received users:', usersList);
      if (Array.isArray(usersList)) {
        setUsers(usersList);
      } else if (usersList && usersList.content && Array.isArray(usersList.content)) {
        setUsers(usersList.content);
      } else {
        console.error('Invalid users data format:', usersList);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список пользователей');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    if (!loginData.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      errors.email = 'Некорректный email';
    }
    if (!loginData.password.trim()) {
      errors.password = 'Пароль обязателен';
    } else if (loginData.password.length < 6) {
      errors.password = 'Минимум 6 символов';
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCredentialForm = () => {
    const errors = {};
    if (!credentialData.role) {
      errors.role = 'Роль обязательна';
    }
    setCredentialErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phone: '',
      address: '',
    });
    setErrors({});
    setLoginData({ email: '', password: '' });
    setLoginErrors({});
    setCredentialData({ role: '' });
    setCredentialErrors({});
    setCreatedUser(null);
    setEditedData(null);
    setOriginalData(null);
    setChangedFields({
      user: {},
      login: {},
      credential: {}
    });
    setStep(1);
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const user = await bankService.createUser(newUser);
      console.log('Created user:', user);
      console.log('User ID:', user.id);
      setCreatedUser(user);
      setStep(2);
      await loadUsers();
      Alert.alert('Успех', 'Пользователь создан. Теперь создайте логин.');
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Не удалось создать пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLogin = async () => {
    if (!validateLoginForm()) return;
    try {
      setLoading(true);
      console.log('Creating login for user:', createdUser);
      const login = await bankService.createLogin({
        ...loginData,
        userId: createdUser.id
      });
      console.log('Created login:', login);
      console.log('Login ID:', login.id);
      setCredentialData({ 
        ...credentialData, 
        loginDetailsId: login.id,
        userId: createdUser.id 
      });
      setStep(3);
      await loadUsers();
      Alert.alert('Успех', 'Логин создан. Теперь выберите роль и создайте креды.');
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Не удалось создать логин');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredential = async () => {
    if (!validateCredentialForm()) return;
    try {
      setLoading(true);
      if (!credentialData.role) {
        Alert.alert('Ошибка', 'Пожалуйста, выберите роль');
        return;
      }

      const selectedRole = roles.find(r => r.id === credentialData.role);
      if (!selectedRole) {
        Alert.alert('Ошибка', 'Выбранная роль не найдена');
        return;
      }

      if (!createdUser || !createdUser.id) {
        Alert.alert('Ошибка', 'ID пользователя не найден');
        return;
      }

      const credentialPayload = {
        userId: createdUser.id,
        loginDetailsId: credentialData.loginDetailsId,
        roleId: selectedRole.id
      };

      console.log('Creating credential with data:', credentialPayload);
      const createdCredential = await bankService.createCredential(credentialPayload);
      console.log('Created credential:', createdCredential);
      
      const initialData = {
        user: { 
          id: createdUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          dateOfBirth: newUser.dateOfBirth,
          phone: newUser.phone,
          address: newUser.address
        },
        login: { 
          id: createdCredential.email.id,
          email: createdCredential.email.email,
          password: loginData.password
        },
        credential: { 
          id: createdCredential.id,
          loginDetailsId: createdCredential.email.id,
          userId: createdUser.id,
          roleId: selectedRole.id,
          roleName: selectedRole.role
        }
      };
      
      console.log('Setting initial data:', initialData);
      setOriginalData(JSON.parse(JSON.stringify(initialData)));
      setEditedData(initialData);
      setStep(4);
    } catch (error) {
      console.error('Error creating credential:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось создать учетные данные');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, section, value) => {
    console.log('Field change:', { field, section, value });
    console.log('Original data:', originalData);
    
    // Обновляем editedData
    setEditedData(prev => {
      const newData = { ...prev };
      if (!newData[section]) {
        newData[section] = {};
      }
      newData[section][field] = value;
      return newData;
    });

    // Обновляем changedFields
    setChangedFields(prev => {
      const newChangedFields = { ...prev };
      if (!newChangedFields[section]) {
        newChangedFields[section] = {};
      }
      
      // Проверяем, изменилось ли значение относительно originalData
      const oldValue = originalData[section]?.[field];
      console.log('Comparing values:', { oldValue, newValue: value });
      
      if (value !== oldValue) {
        newChangedFields[section][field] = value;
      } else {
        delete newChangedFields[section][field];
      }
      
      console.log('New changedFields:', newChangedFields);
      return newChangedFields;
    });
  };

  const handleCreateAccount = async (userId) => {
    try {
      setLoading(true);
      const accountData = {
        userId,
        currency: 'BYN',
        accountType: 'CURRENT',
      };
      await bankService.createAccount(accountData);
      Alert.alert('Успех', 'Счет успешно создан');
      loadUsers();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать счет');
    } finally {
      setLoading(false);
    }
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
      loadUsers();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать карту');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setStep(1);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Проверяем изменения в данных пользователя
      if (JSON.stringify(editedData.user) !== JSON.stringify(originalData.user)) {
        if (!editedData.user.id) {
          throw new Error('ID пользователя не найден');
        }
        const updatedUser = await bankService.updateUser(editedData.user.id, editedData.user);
        // Обновляем данные пользователя в editedData
        editedData.user = {
          id: updatedUser.id,
          firstName: updatedUser.name,
          lastName: updatedUser.surname,
          dateOfBirth: updatedUser.dateOfBirth,
          phone: updatedUser.contactPhone,
          address: updatedUser.address
        };
      }

      // Проверяем изменения в данных логина
      if (JSON.stringify(editedData.login) !== JSON.stringify(originalData.login)) {
        if (!editedData.login.id) {
          throw new Error('ID логина не найден');
        }
        await bankService.updateLoginDetails(editedData.login.id, editedData.login);
      }

      // Проверяем изменения в данных креденшиалов
      if (JSON.stringify(editedData.credential) !== JSON.stringify(originalData.credential)) {
        if (!editedData.credential.id) {
          throw new Error('ID креденшиалов не найден');
        }
        const credentialData = {
          login_details_id: editedData.login.id,
          role_id: editedData.credential.roleId
        };
        await bankService.updateCredential(editedData.credential.id, credentialData);
      }

      Alert.alert('Успех', 'Данные успешно обновлены');
      setOriginalData(JSON.parse(JSON.stringify(editedData)));
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось сохранить изменения');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      if (createdUser && createdUser.id) {
        console.log('Deleting user with ID:', createdUser.id);
        
        // Удаляем только логин, остальное обработается на бэкенде
        if (credentialData && credentialData.loginDetailsId) {
          console.log('Deleting login with ID:', credentialData.loginDetailsId);
          await bankService.deleteLogin(credentialData.loginDetailsId);
          Alert.alert('Успех', 'Пользователь успешно удален');
          resetForm();
        } else {
          throw new Error('Не удалось найти ID логина для удаления');
        }
      } else {
        console.error('No user ID found for deletion');
        Alert.alert('Ошибка', 'Не удалось найти ID пользователя для удаления');
      }
    } catch (error) {
      console.error('Error in handleCancel:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось удалить пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    resetForm();
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.section}>
        {step === 1 && (
          <>
            <Text style={styles.sectionTitle}>Создать нового пользователя</Text>
            
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="Имя"
              value={newUser.firstName}
              onChangeText={(text) => {
                setNewUser({ ...newUser, firstName: text });
                if (errors.firstName) setErrors({ ...errors, firstName: null });
              }}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Фамилия"
              value={newUser.lastName}
              onChangeText={(text) => {
                setNewUser({ ...newUser, lastName: text });
                if (errors.lastName) setErrors({ ...errors, lastName: null });
              }}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

            <TouchableOpacity
              style={[styles.input, errors.dateOfBirth && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={newUser.dateOfBirth ? styles.dateText : styles.placeholderText}>
                {newUser.dateOfBirth || 'Дата рождения (YYYY-MM-DD)'}
              </Text>
            </TouchableOpacity>
            {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Телефон"
              value={newUser.phone}
              onChangeText={(text) => {
                setNewUser({ ...newUser, phone: text });
                if (errors.phone) setErrors({ ...errors, phone: null });
              }}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="Адрес"
              value={newUser.address}
              onChangeText={(text) => {
                setNewUser({ ...newUser, address: text });
                if (errors.address) setErrors({ ...errors, address: null });
              }}
              multiline
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCreateUser}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Создать пользователя</Text>}
            </TouchableOpacity>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.sectionTitle}>Создать логин для пользователя</Text>
            <TextInput
              style={[styles.input, loginErrors.email && styles.inputError]}
              placeholder="Email"
              value={loginData.email}
              onChangeText={(text) => {
                setLoginData({ ...loginData, email: text });
                if (loginErrors.email) setLoginErrors({ ...loginErrors, email: null });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {loginErrors.email && <Text style={styles.errorText}>{loginErrors.email}</Text>}
            <TextInput
              style={[styles.input, loginErrors.password && styles.inputError]}
              placeholder="Пароль"
              value={loginData.password}
              onChangeText={(text) => {
                setLoginData({ ...loginData, password: text });
                if (loginErrors.password) setLoginErrors({ ...loginErrors, password: null });
              }}
              secureTextEntry
            />
            {loginErrors.password && <Text style={styles.errorText}>{loginErrors.password}</Text>}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCreateLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Создать логин</Text>}
            </TouchableOpacity>
          </>
        )}
        {step === 3 && (
          <>
            <Text style={styles.sectionTitle}>Создать креды для пользователя</Text>
            <Text style={{ marginBottom: 8 }}>Пользователь: {createdUser?.name} {createdUser?.surname}</Text>
            <Text style={{ marginBottom: 8 }}>Email: {loginData.email}</Text>
            <Text style={{ marginBottom: 8 }}>Выберите роль:</Text>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleButton,
                  credentialData.role === role.id && styles.roleButtonSelected
                ]}
                onPress={() => {
                  console.log('Selected role:', role);
                  setCredentialData({ ...credentialData, role: role.id });
                }}
              >
                <Text style={[
                  styles.roleButtonText,
                  credentialData.role === role.id && styles.roleButtonTextSelected
                ]}>
                  {role.role}
                </Text>
              </TouchableOpacity>
            ))}
            {credentialErrors.role && <Text style={styles.errorText}>{credentialErrors.role}</Text>}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCreateCredential}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Создать креды</Text>}
            </TouchableOpacity>
          </>
        )}
        {step === 4 && (
          <>
            <Text style={styles.sectionTitle}>Подтверждение данных</Text>
            
            <View style={styles.confirmationSection}>
              <Text style={styles.confirmationTitle}>Данные пользователя:</Text>
              <TextInput
                style={[styles.input, styles.confirmationInput]}
                value={editedData.user.firstName}
                onChangeText={(value) => handleFieldChange('firstName', 'user', value)}
                placeholder="Имя"
              />
              <TextInput
                style={[styles.input, styles.confirmationInput]}
                value={editedData.user.lastName}
                onChangeText={(value) => handleFieldChange('lastName', 'user', value)}
                placeholder="Фамилия"
              />
              <TouchableOpacity
                style={[styles.input, styles.confirmationInput]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={editedData.user.dateOfBirth ? styles.dateText : styles.placeholderText}>
                  {editedData.user.dateOfBirth || 'Дата рождения (YYYY-MM-DD)'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(editedData.user.dateOfBirth)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formattedDate = selectedDate.toISOString().split('T')[0];
                      handleFieldChange('dateOfBirth', 'user', formattedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
              <TextInput
                style={[styles.input, styles.confirmationInput]}
                value={editedData.user.phone}
                onChangeText={(value) => handleFieldChange('phone', 'user', value)}
                placeholder="Телефон"
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.input, styles.confirmationInput]}
                value={editedData.user.address}
                onChangeText={(value) => handleFieldChange('address', 'user', value)}
                placeholder="Адрес"
                multiline
              />
            </View>

            <View style={styles.confirmationSection}>
              <Text style={styles.confirmationTitle}>Данные для входа:</Text>
              <TextInput
                style={[styles.input, styles.confirmationInput]}
                value={editedData.login.email}
                onChangeText={(value) => handleFieldChange('email', 'login', value)}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.confirmationSection}>
              <Text style={styles.confirmationTitle}>Роль:</Text>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleButton,
                    editedData.credential.roleId === role.id && styles.roleButtonSelected
                  ]}
                  onPress={() => {
                    console.log('Selected role:', role);
                    console.log('Current credential data:', editedData.credential);
                    handleFieldChange('roleId', 'credential', role.id);
                  }}
                >
                  <Text style={[
                    styles.roleButtonText,
                    editedData.credential.roleId === role.id && styles.roleButtonTextSelected
                  ]}>
                    {role.role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleSaveChanges}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Сохранить изменения</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.finishButton]}
                onPress={handleFinish}
              >
                <Text style={styles.buttonText}>Завершить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Удалить пользователя</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  roleButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  roleButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#000',
  },
  roleButtonTextSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  confirmationInput: {
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  confirmationSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007AFF',
  },
  confirmationButtons: {
    marginTop: 24,
  },
  confirmButton: {
    backgroundColor: '#34C759',
    marginBottom: 12,
  },
  finishButton: {
    backgroundColor: '#007AFF',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
}); 