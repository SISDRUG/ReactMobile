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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bankService } from '../services/bankService';

export const CreateAccountScreen = ({ route, navigation }) => {
  const { userId, credentialId } = route.params;
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [selectedType, setSelectedType] = useState('CURRENT');
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const currenciesList = await bankService.getCurrencies();
      setCurrencies(currenciesList);
      if (currenciesList.length > 0) {
        setSelectedCurrency(currenciesList[0].id);
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список валют');
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedCurrency) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите валюту');
      return;
    }

    try {
      setLoading(true);
      const accountData = {
        userId,
        currencyId: selectedCurrency,
        type: selectedType,
        credentialId,
      };
      await bankService.createAccount(accountData);
      Alert.alert('Успех', 'Счет успешно создан', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Ошибка', 'Не удалось создать счет');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Создание нового счета</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Тип счета</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === 'CURRENT' && styles.selectedType,
            ]}
            onPress={() => setSelectedType('CURRENT')}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === 'CURRENT' && styles.selectedTypeText,
              ]}
            >
              Текущий
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === 'SAVINGS' && styles.selectedType,
            ]}
            onPress={() => setSelectedType('SAVINGS')}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === 'SAVINGS' && styles.selectedTypeText,
              ]}
            >
              Сберегательный
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Валюта</Text>
        <View style={styles.currencyContainer}>
          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency.id}
              style={[
                styles.currencyButton,
                selectedCurrency === currency.id && styles.selectedCurrency,
              ]}
              onPress={() => setSelectedCurrency(currency.id)}
            >
              <Text
                style={[
                  styles.currencyButtonText,
                  selectedCurrency === currency.id && styles.selectedCurrencyText,
                ]}
              >
                {currency.curAbbreviation}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Создать</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedType: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#000',
  },
  selectedTypeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  currencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectedCurrency: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  currencyButtonText: {
    fontSize: 16,
    color: '#000',
  },
  selectedCurrencyText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  createButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 