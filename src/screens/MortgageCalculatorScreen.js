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

export const MortgageCalculatorScreen = ({ route, navigation }) => {
  const [propertyCost, setPropertyCost] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('');
  const [months, setMonths] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [result, setResult] = useState(null);

  const calculateMortgage = () => {
    if (!propertyCost || !months || !interestRate) {
      setResult(null);
      return;
    }

    const cost = parseFloat(propertyCost);
    const period = parseInt(months);
    const rate = parseFloat(interestRate) / 100 / 12; // месячная процентная ставка
    
    // Расчет суммы кредита с учетом первоначального взноса
    const downPaymentAmount = downPayment ? parseFloat(downPayment) : (cost * parseFloat(downPaymentPercent) / 100);
    const loanAmount = cost - downPaymentAmount;

    // Расчет аннуитетного платежа
    const monthlyPayment = loanAmount * (rate * Math.pow(1 + rate, period)) / (Math.pow(1 + rate, period) - 1);
    
    // Общая сумма выплат
    const totalPayment = monthlyPayment * period;
    
    // Сумма процентов
    const totalInterest = totalPayment - loanAmount;

    // График платежей
    let balance = loanAmount;
    const schedule = [];
    
    for (let i = 1; i <= period; i++) {
      const interestPayment = balance * rate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(0, balance - principalPayment);

      schedule.push({
        month: i,
        payment: monthlyPayment.toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interestPayment.toFixed(2),
        balance: balance.toFixed(2)
      });
    }

    setResult({
      loanAmount: loanAmount.toFixed(2),
      downPaymentAmount: downPaymentAmount.toFixed(2),
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      schedule: schedule
    });
  };

  const handlePropertyCostChange = (text) => {
    setPropertyCost(text.replace(/[^0-9.]/g, ''));
  };

  const handleDownPaymentChange = (text) => {
    setDownPayment(text.replace(/[^0-9.]/g, ''));
    setDownPaymentPercent('');
  };

  const handleDownPaymentPercentChange = (text) => {
    setDownPaymentPercent(text.replace(/[^0-9.]/g, ''));
    setDownPayment('');
  };

  const handleMonthsChange = (text) => {
    setMonths(text.replace(/[^0-9]/g, ''));
  };

  const handleRateChange = (text) => {
    setInterestRate(text.replace(/[^0-9.]/g, ''));
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
            <Text style={styles.label}>Стоимость недвижимости (BYN)</Text>
            <TextInput
              style={styles.input}
              value={propertyCost}
              onChangeText={handlePropertyCostChange}
              keyboardType="numeric"
              placeholder="Введите стоимость"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Первоначальный взнос (BYN)</Text>
            <TextInput
              style={styles.input}
              value={downPayment}
              onChangeText={handleDownPaymentChange}
              keyboardType="numeric"
              placeholder="Введите сумму"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Первоначальный взнос (%)</Text>
            <TextInput
              style={styles.input}
              value={downPaymentPercent}
              onChangeText={handleDownPaymentPercentChange}
              keyboardType="numeric"
              placeholder="Введите процент"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Срок кредита (месяцев)</Text>
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

          <TouchableOpacity style={styles.calculateButton} onPress={calculateMortgage}>
            <Text style={styles.calculateButtonText}>Рассчитать</Text>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultContainer}>
              <View style={styles.summarySection}>
                <Text style={styles.resultTitle}>Общая информация:</Text>
                <Text style={styles.resultText}>Сумма кредита: {result.loanAmount} BYN</Text>
                <Text style={styles.resultText}>Первоначальный взнос: {result.downPaymentAmount} BYN</Text>
                <Text style={styles.resultText}>Ежемесячный платеж: {result.monthlyPayment} BYN</Text>
                <Text style={styles.resultText}>Общая сумма выплат: {result.totalPayment} BYN</Text>
                <Text style={styles.resultText}>Сумма процентов: {result.totalInterest} BYN</Text>
              </View>

              <View style={styles.scheduleSection}>
                <Text style={styles.resultTitle}>График платежей:</Text>
                {result.schedule.map((payment, index) => (
                  <View key={index} style={styles.scheduleItem}>
                    <Text style={styles.scheduleMonth}>Месяц {payment.month}</Text>
                    <View style={styles.scheduleDetails}>
                      <Text style={styles.scheduleText}>Платеж: {payment.payment} BYN</Text>
                      <Text style={styles.scheduleText}>Основной долг: {payment.principal} BYN</Text>
                      <Text style={styles.scheduleText}>Проценты: {payment.interest} BYN</Text>
                      <Text style={styles.scheduleText}>Остаток: {payment.balance} BYN</Text>
                    </View>
                  </View>
                ))}
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
  summarySection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scheduleSection: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  scheduleItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  scheduleMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scheduleDetails: {
    marginLeft: 8,
  },
  scheduleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
}); 