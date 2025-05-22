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
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { currencyService } from '../services/currencyService';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundPattern } from '../components/BackgroundPattern';

const { width } = Dimensions.get('window');

export const CurrencyCalculatorScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyRates, setCurrencyRates] = useState(null);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('RUB');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

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
    <View style={styles.container}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Ionicons name="calculator-outline" size={32} color="#fff" />
            <Text style={styles.title}>Калькулятор валют</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Введите сумму"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={handleAmountChange}
            />

            <View style={styles.pickerContainer}>
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Из</Text>
                <Picker
                  selectedValue={fromCurrency}
                  style={styles.picker}
                  onValueChange={(itemValue) => setFromCurrency(itemValue)}
                  dropdownIconColor="#fff"
                >
                  {availableCurrencies.map((currency) => (
                    <Picker.Item 
                      key={currency} 
                      label={currency} 
                      value={currency}
                      color="#333"
                    />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity 
                style={styles.swapButton}
                onPress={() => {
                  const temp = fromCurrency;
                  setFromCurrency(toCurrency);
                  setToCurrency(temp);
                }}
              >
                <Ionicons name="swap-horizontal" size={24} color="#fff" />
              </TouchableOpacity>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>В</Text>
                <Picker
                  selectedValue={toCurrency}
                  style={styles.picker}
                  onValueChange={(itemValue) => setToCurrency(itemValue)}
                  dropdownIconColor="#fff"
                >
                  {availableCurrencies.map((currency) => (
                    <Picker.Item 
                      key={currency} 
                      label={currency} 
                      value={currency}
                      color="#333"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {result !== '' && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Результат:</Text>
                <Text style={styles.resultText}>
                  {result} {toCurrency}
                </Text>
              </View>
            )}

            {error && currencyRates && (
              <Text style={styles.errorText}>Ошибка расчета: {error}</Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    height: 150,
  },
  pickerLabel: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    zIndex: 1,
  },
  picker: {
    height: 20,
    marginTop: -50,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
}); 