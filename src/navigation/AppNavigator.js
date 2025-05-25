import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoginScreen } from '../screens/LoginScreen';
import { TabNavigator } from './TabNavigator';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UserListScreen } from '../screens/UserListScreen';
import { UserManagementScreen } from '../screens/UserManagementScreen';
import { UserDetailsScreen } from '../screens/UserDetailsScreen';
import { CreateAccountScreen } from '../screens/CreateAccountScreen';
import { UserManagementScreen as EditUser } from '../screens/UserManagementScreen';
import { InfoScreen } from '../screens/InfoScreen';
import { InfoDetailScreen } from '../screens/InfoDetailScreen';
import { CalculatorsScreen } from '../screens/CalculatorsScreen';
import { CurrencyCalculatorScreen } from '../screens/CurrencyCalculatorScreen';
import { DepositCalculatorScreen } from '../screens/DepositCalculatorScreen';
import { LoanCalculatorScreen } from '../screens/LoanCalculatorScreen';
import { MortgageCalculatorScreen } from '../screens/MortgageCalculatorScreen';

const Stack = createStackNavigator();

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen 
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen 
        name="UserList" 
        component={UserListScreen}
        options={{ title: 'Список пользователей' }}
      />
      <Stack.Screen 
        name="UserManagement" 
        component={UserManagementScreen}
        options={{ title: 'Управление пользователем' }}
      />
      <Stack.Screen
        name="UserDetails"
        component={UserDetailsScreen}
        options={({ navigation }) => ({
          title: 'Информация о пользователе',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
        options={({ navigation }) => ({
          title: 'Создание счета',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="EditUser"
        component={EditUser}
        options={({ navigation }) => ({
          title: 'Редактирование пользователя',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Info"
        component={InfoScreen}
        options={{ title: 'Полезная информация' }}
      />
      <Stack.Screen
        name="InfoDetail"
        component={InfoDetailScreen}
        options={({ navigation }) => ({
          title: 'Детальная информация',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Calculators"
        component={CalculatorsScreen}
        options={{ title: 'Калькуляторы' }}
      />
      <Stack.Screen
        name="CurrencyCalculator"
        component={CurrencyCalculatorScreen}
        options={({ navigation }) => ({
          title: 'Калькулятор валют',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="DepositCalculator"
        component={DepositCalculatorScreen}
        options={({ navigation }) => ({
          title: 'Калькулятор вкладов',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="LoanCalculator"
        component={LoanCalculatorScreen}
        options={({ navigation }) => ({
          title: 'Калькулятор кредитов',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="MortgageCalculator"
        component={MortgageCalculatorScreen}
        options={({ navigation }) => ({
          title: 'Калькулятор ипотеки',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}; 