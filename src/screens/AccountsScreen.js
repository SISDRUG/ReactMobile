import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { bankService } from '../services/bankService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const AccountsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const formatBalance = (balance) => {
    if (balance === undefined || balance === null) return 'Н/Д';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(balance);
  };

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const accountsData = await bankService.getAccounts();
      if (accountsData && Array.isArray(accountsData.content)) {
        setAccounts(accountsData.content);
      } else {
        setAccounts([]);
        setError('Неверный формат данных счетов');
      }
      console.log('Accounts data:', accountsData);
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError(err.message || 'Не удалось загрузить счета');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка счетов...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAccounts}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getAccountIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'credit':
        return 'credit-card';
      case 'savings':
        return 'piggy-bank';
      case 'checking':
        return 'bank';
      default:
        return 'wallet';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Счета</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Мои счета</Text>
          {!Array.isArray(accounts) || accounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="wallet-off" size={64} color="#666" />
              <Text style={styles.emptyText}>Нет доступных счетов</Text>
            </View>
          ) : (
            accounts.map((account) => (
              <TouchableOpacity 
                key={account.id} 
                style={styles.accountItem}
                onPress={() => Alert.alert('Детали счета', `Тип: ${account.type || 'Н/Д'}\nБаланс: ${formatBalance(account.balance)}`)}
              >
                <View style={styles.accountIconContainer}>
                  <MaterialCommunityIcons 
                    name={getAccountIcon(account.type)} 
                    size={32} 
                    color="#007AFF" 
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountNumber}>
                    Счет: {account.id || 'Н/Д'}
                  </Text>
                  <Text style={styles.accountBalance}>
                    {formatBalance(account.balance)}
                  </Text>
                  <Text style={styles.accountType}>
                    {account.type || 'Н/Д'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accountItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accountIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  accountInfo: {
    flex: 1,
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  accountType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
}); 