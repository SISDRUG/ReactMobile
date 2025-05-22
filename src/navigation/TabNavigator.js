import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainScreen } from '../screens/MainScreen';
import { AccountsScreen } from '../screens/AccountsScreen';
import { CurrencyCalculatorScreen } from '../screens/CurrencyCalculatorScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Главная') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Счета') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Калькулятор') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          }
          // Добавьте иконки для других вкладок, если необходимо

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Главная" component={MainScreen} />
      <Tab.Screen name="Счета" component={AccountsScreen} />
      <Tab.Screen name="Калькулятор" component={CurrencyCalculatorScreen} />
      {/* TODO: Добавить другие вкладки, например, Платежи, Журнал, Еще */}
    </Tab.Navigator>
  );
}; 