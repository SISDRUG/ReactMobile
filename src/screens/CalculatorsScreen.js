import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CalculatorCard = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardContent}>
      <Ionicons name={icon} size={32} color="#007AFF" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#8E8E93" />
  </TouchableOpacity>
);

export const CalculatorsScreen = ({ navigation }) => {
  const calculators = [
    {
      title: 'Калькулятор валют',
      icon: 'swap-horizontal-outline',
      screen: 'CurrencyCalculator',
      description: 'Конвертация валют по текущему курсу'
    },
    {
      title: 'Калькулятор вкладов',
      icon: 'wallet-outline',
      screen: 'DepositCalculator',
      description: 'Расчет доходности по вкладам'
    },
    {
      title: 'Калькулятор кредитов',
      icon: 'cash-outline',
      screen: 'LoanCalculator',
      description: 'Расчет ежемесячных платежей по кредиту'
    },
    {
      title: 'Калькулятор ипотеки',
      icon: 'home-outline',
      screen: 'MortgageCalculator',
      description: 'Расчет ипотечного кредита'
    }
  ];

  const handleCalculatorPress = (calculator) => {
    navigation.navigate(calculator.screen, { title: calculator.title });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Калькуляторы</Text>
        </View>
        <View style={styles.content}>
          {calculators.map((calculator, index) => (
            <CalculatorCard
              key={index}
              title={calculator.title}
              icon={calculator.icon}
              onPress={() => handleCalculatorPress(calculator)}
            />
          ))}
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: '#000',
  },
}); 