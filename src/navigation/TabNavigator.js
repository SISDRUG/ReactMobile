import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainScreen } from '../screens/MainScreen';
import { UserManagementScreen } from '../screens/UserManagementScreen';
import { UserListScreen } from '../screens/UserListScreen';
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
          } else if (route.name === 'Создание пользователя') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          } else if (route.name === 'Список пользователей') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Главная" component={MainScreen} />
      <Tab.Screen name="Создание пользователя" component={UserManagementScreen} />
      <Tab.Screen name="Список пользователей" component={UserListScreen} />
    </Tab.Navigator>
  );
}; 