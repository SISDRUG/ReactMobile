import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  Modal,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { currencyService } from '../services/currencyService';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundPattern } from '../components/BackgroundPattern';

const { width } = Dimensions.get('window');

export const CurrencyCalculatorScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyRates, setCurrencyRates] = useState(null);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('BYN');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState(null); // 'from' или 'to'

  const loadCurrencyRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const ratesData = await currencyService.getCurrencyRates();
      if (ratesData && ratesData.rates) {
        setCurrencyRates(ratesData.rates);
        const availableCurrencies = Object.keys(ratesData.rates);

        if (availableCurrencies.includes('BYN')) {
             setFromCurrency('BYN');
             if (availableCurrencies.includes('USD')) {
                 setToCurrency('USD');
             } else if (availableCurrencies.length > 1) {
                  const otherCurrencies = availableCurrencies.filter(cur => cur !== 'BYN');
                  if(otherCurrencies.length > 0) setToCurrency(otherCurrencies[0]);
                  else setToCurrency('BYN');
             } else {
                 setToCurrency('BYN');
             }
         } else if (availableCurrencies.length > 0) {
             setFromCurrency(availableCurrencies[0]);
             if (availableCurrencies.length > 1) {
                 setToCurrency(availableCurrencies[1]);
             } else {
                 setToCurrency(availableCurrencies[0]);
             }
         } else {
             setFromCurrency('RUB');
             setToCurrency('USD');
             setError('No currency rates available from backend');
         }

      } else {
        setError('Invalid currency rates data format');
      }
      console.log('Currency Rates for Calculator:', ratesData);
    } catch (err) {
      console.error('Error loading currency rates:', err);
      setError(err.message || 'Failed to load currency rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencyRates();
  }, []);

  useEffect(() => {
    if (amount && currencyRates) {
      calculateCurrency();
    } else {
        setResult('');
    }
  }, [amount, fromCurrency, toCurrency, currencyRates]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const calculateCurrency = () => {
    if (!amount || isNaN(parseFloat(amount)) || !currencyRates) {
      setResult('');
      return;
    }

    const numericAmount = parseFloat(amount);
    const rateFrom = currencyRates[fromCurrency];
    const rateTo = currencyRates[toCurrency];

    console.log(`Calculating: ${numericAmount} ${fromCurrency} to ${toCurrency}`);
    console.log(`Rate From (${fromCurrency}): ${rateFrom}`);
    console.log(`Rate To (${toCurrency}): ${rateTo}`);

    if (rateFrom === undefined || rateTo === undefined || rateFrom === 0) {
         setResult('Rates not available or invalid for selected currencies');
         console.error('Calculation error: Rates are undefined or rateFrom is zero');
         return;
    }

    const resultAmount = (numericAmount * rateFrom) / rateTo;
    setResult(resultAmount.toFixed(2));
    console.log(`Result: ${resultAmount.toFixed(2)} ${toCurrency}`);
  };

  const handleAmountChange = (text) => {
    setAmount(text.replace(/[^0-9.]/g, ''));
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult(null);
  };

  const openCurrencySelector = (type) => {
    setSelectingFor(type);
    setModalVisible(true);
  };

  const selectCurrency = (currency) => {
    if (selectingFor === 'from') {
      setFromCurrency(currency);
    } else {
      setToCurrency(currency);
    }
    setModalVisible(false);
  };

  const CurrencySelectorModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите валюту</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={currencyRates ? Object.keys(currencyRates) : []}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.currencyItem}
                onPress={() => selectCurrency(item)}
              >
                <Text style={styles.currencyItemText}>{item}</Text>
                {(item === fromCurrency || item === toCurrency) && (
                  <Ionicons name="checkmark" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error && !currencyRates) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCurrencyRates}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availableCurrencies = currencyRates ? Object.keys(currencyRates) : [];
   if (!availableCurrencies.includes('BYN')) {
      availableCurrencies.unshift('BYN');
   }
   availableCurrencies.sort();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{route.params.title}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Сумма</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="Введите сумму"
            />
          </View>

          <View style={styles.currencyContainer}>
            <View style={styles.currencyInput}>
              <Text style={styles.label}>Из</Text>
              <TouchableOpacity 
                style={styles.currencySelector}
                onPress={() => openCurrencySelector('from')}
              >
                <Text style={styles.currencyText}>{fromCurrency}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={swapCurrencies} style={styles.swapButton}>
              <Ionicons name="swap-horizontal" size={24} color="#007AFF" />
            </TouchableOpacity>

            <View style={styles.currencyInput}>
              <Text style={styles.label}>В</Text>
              <TouchableOpacity 
                style={styles.currencySelector}
                onPress={() => openCurrencySelector('to')}
              >
                <Text style={styles.currencyText}>{toCurrency}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateCurrency}>
            <Text style={styles.calculateButtonText}>Рассчитать</Text>
          </TouchableOpacity>

          {result !== '' && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Результат:</Text>
              <Text style={styles.resultValue}>
                {result} {toCurrency}
              </Text>
            </View>
          )}

          {error && currencyRates && (
            <Text style={styles.errorText}>Ошибка расчета: {error}</Text>
          )}
        </View>
      </ScrollView>
      <CurrencySelectorModal />
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  content: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  currencyInput: {
    flex: 1,
  },
  currencySelector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 18,
    textAlign: 'center',
  },
  swapButton: {
    padding: 10,
    marginHorizontal: 10,
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  currencyItemText: {
    fontSize: 18,
    color: '#000',
  },
}); 