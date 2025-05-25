import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const DepositCalculatorScreen = ({ route, navigation }) => {
  const [amount, setAmount] = useState('');
  const [months, setMonths] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [refinancingRate, setRefinancingRate] = useState('');
  const [result, setResult] = useState(null);

  const calculateDeposit = () => {
    if (!amount || !months || !interestRate || !refinancingRate) {
      setResult(null);
      return;
    }

    const principal = parseFloat(amount);
    const period = parseInt(months);
    const rate = parseFloat(interestRate) / 100;
    const refRate = parseFloat(refinancingRate) / 100;

    // Расчет простых процентов
    const simpleInterest = principal * rate * (period / 12);
    
    // Расчет сложных процентов с ежемесячной капитализацией
    const compoundInterest = principal * (Math.pow(1 + rate / 12, period) - 1);
    
    // Расчет с учетом рефинансирования
    const refinancingInterest = principal * (Math.pow(1 + refRate / 12, period) - 1);

    setResult({
      simpleInterest: simpleInterest.toFixed(2),
      compoundInterest: compoundInterest.toFixed(2),
      refinancingInterest: refinancingInterest.toFixed(2),
      totalSimple: (principal + simpleInterest).toFixed(2),
      totalCompound: (principal + compoundInterest).toFixed(2),
      totalRefinancing: (principal + refinancingInterest).toFixed(2)
    });
  };

  const handleAmountChange = (text) => {
    setAmount(text.replace(/[^0-9.]/g, ''));
  };

  const handleMonthsChange = (text) => {
    setMonths(text.replace(/[^0-9]/g, ''));
  };

  const handleRateChange = (text) => {
    setInterestRate(text.replace(/[^0-9.]/g, ''));
  };

  const handleRefinancingRateChange = (text) => {
    setRefinancingRate(text.replace(/[^0-9.]/g, ''));
  };

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
            <Text style={styles.label}>Сумма вклада (BYN)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="Введите сумму"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Срок вклада (месяцев)</Text>
            <TextInput
              style={styles.input}
              value={months}
              onChangeText={handleMonthsChange}
              keyboardType="numeric"
              placeholder="Введите срок"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Процентная ставка (%)</Text>
            <TextInput
              style={styles.input}
              value={interestRate}
              onChangeText={handleRateChange}
              keyboardType="numeric"
              placeholder="Введите ставку"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ставка рефинансирования (%)</Text>
            <TextInput
              style={styles.input}
              value={refinancingRate}
              onChangeText={handleRefinancingRateChange}
              keyboardType="numeric"
              placeholder="Введите ставку рефинансирования"
            />
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateDeposit}>
            <Text style={styles.calculateButtonText}>Рассчитать</Text>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultContainer}>
              <View style={styles.resultSection}>
                <Text style={styles.resultTitle}>Простые проценты:</Text>
                <Text style={styles.resultText}>Доход: {result.simpleInterest} BYN</Text>
                <Text style={styles.resultText}>Итого: {result.totalSimple} BYN</Text>
              </View>

              <View style={styles.resultSection}>
                <Text style={styles.resultTitle}>Сложные проценты:</Text>
                <Text style={styles.resultText}>Доход: {result.compoundInterest} BYN</Text>
                <Text style={styles.resultText}>Итого: {result.totalCompound} BYN</Text>
              </View>

              <View style={styles.resultSection}>
                <Text style={styles.resultTitle}>С учетом рефинансирования:</Text>
                <Text style={styles.resultText}>Доход: {result.refinancingInterest} BYN</Text>
                <Text style={styles.resultText}>Итого: {result.totalRefinancing} BYN</Text>
              </View>
            </View>
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
  resultSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
}); 