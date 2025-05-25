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
  FlatList,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { bankService } from '../services/bankService';

export const UserListScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchParams, setSearchParams] = useState({
    name: '',
    surname: '',
    email: '',
    phone: ''
  });
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersList = await bankService.getUsers();
      if (Array.isArray(usersList)) {
        setUsers(usersList);
      } else if (usersList && usersList.content && Array.isArray(usersList.content)) {
        setUsers(usersList.content);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setLoading(true);
      Keyboard.dismiss();

      // Проверяем, есть ли хотя бы одно заполненное поле поиска
      const hasSearchParams = Object.values(searchParams).some(value => value.trim() !== '');
      
      if (!hasSearchParams) {
        console.log('No search parameters provided, loading all users');
        await loadUsers();
        return;
      }

      console.log('Executing search with params:', searchParams);
      const searchResults = await bankService.searchUsers(searchParams);
      console.log('Search results:', searchResults);
      
      if (Array.isArray(searchResults)) {
        setUsers(searchResults);
      } else {
        console.warn('Unexpected search results format:', searchResults);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert(
        'Ошибка поиска',
        'Не удалось выполнить поиск. Пожалуйста, проверьте введенные данные и попробуйте снова.'
      );
      setUsers([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearchFieldChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearSearch = () => {
    setSearchParams({
      name: '',
      surname: '',
      email: '',
      phone: ''
    });
    loadUsers();
    setShowSearch(false);
  };

  const handleUserPress = (user) => {
    navigation.navigate('UserDetails', { user });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name} {item.surname}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.contactPhone}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const renderSearchForm = () => (
    <View style={styles.searchForm}>
      <TextInput
        style={[styles.input, styles.searchInput]}
        placeholder="Имя"
        value={searchParams.name}
        onChangeText={(value) => handleSearchFieldChange('name', value)}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <TextInput
        style={[styles.input, styles.searchInput]}
        placeholder="Фамилия"
        value={searchParams.surname}
        onChangeText={(value) => handleSearchFieldChange('surname', value)}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <TextInput
        style={[styles.input, styles.searchInput]}
        placeholder="Email"
        value={searchParams.email}
        onChangeText={(value) => handleSearchFieldChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <TextInput
        style={[styles.input, styles.searchInput]}
        placeholder="Телефон"
        value={searchParams.phone}
        onChangeText={(value) => handleSearchFieldChange('phone', value)}
        keyboardType="phone-pad"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <View style={styles.searchButtons}>
        <TouchableOpacity
          style={[styles.button, styles.searchSubmitButton]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Поиск</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearSearch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Очистить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Список пользователей</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Text style={styles.searchButtonText}>
            {showSearch ? 'Скрыть поиск' : 'Поиск'}
          </Text>
        </TouchableOpacity>
      </View>

      {showSearch && renderSearchForm()}

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadUsers}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isSearching ? 'Пользователи не найдены' : 'Нет пользователей'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchForm: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
  searchInput: {
    marginBottom: 8,
  },
  searchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchSubmitButton: {
    flex: 1,
    marginRight: 8,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 24,
    color: '#007AFF',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 