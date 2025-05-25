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

const InfoCard = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardContent}>
      <Ionicons name={icon} size={32} color="#007AFF" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#8E8E93" />
  </TouchableOpacity>
);

export const InfoScreen = ({ navigation }) => {
  const infoSections = [
    {
      title: 'Вклады',
      icon: 'wallet-outline',
      content: {
        title: 'Виды вкладов',
        sections: [
          {
            title: 'Срочный вклад',
            description: 'Вклад на определенный срок с фиксированной процентной ставкой. Чем дольше срок, тем выше ставка.',
            features: [
              'Минимальная сумма: 100 BYN',
              'Срок: от 3 месяцев до 3 лет',
              'Процентная ставка: до 12% годовых',
              'Возможность пополнения и частичного снятия'
            ]
          },
          {
            title: 'Накопительный вклад',
            description: 'Вклад с возможностью пополнения и снятия средств в любое время.',
            features: [
              'Минимальная сумма: 50 BYN',
              'Срок: не ограничен',
              'Процентная ставка: до 8% годовых',
              'Свободное пополнение и снятие'
            ]
          }
        ]
      }
    },
    {
      title: 'Банковские карты',
      icon: 'card-outline',
      content: {
        title: 'Виды карт',
        sections: [
          {
            title: 'Дебетовая карта',
            description: 'Карта для повседневных расходов с вашего счета.',
            features: [
              'Бесплатное обслуживание',
              'Кэшбэк до 5%',
              'Бесплатные переводы',
              'Мобильный банкинг'
            ]
          },
          {
            title: 'Кредитная карта',
            description: 'Карта с кредитным лимитом для покупок в рассрочку.',
            features: [
              'Кредитный лимит до 5000 BYN',
              'Льготный период до 55 дней',
              'Процентная ставка от 15% годовых',
              'Бесплатное обслуживание при тратах от 1000 BYN в месяц'
            ]
          }
        ]
      }
    },
    {
      title: 'Банковские счета',
      icon: 'cash-outline',
      content: {
        title: 'Виды счетов',
        sections: [
          {
            title: 'Текущий счет',
            description: 'Основной счет для повседневных операций.',
            features: [
              'Бесплатное открытие',
              'Бесплатное обслуживание',
              'Доступ к интернет-банкингу',
              'Возможность привязки карты'
            ]
          },
          {
            title: 'Сберегательный счет',
            description: 'Счет для накопления средств с начислением процентов.',
            features: [
              'Начисление процентов на остаток',
              'Минимальная сумма: 100 BYN',
              'Процентная ставка: до 5% годовых',
              'Возможность пополнения'
            ]
          }
        ]
      }
    },
    {
      title: 'Переводы',
      icon: 'swap-horizontal-outline',
      content: {
        title: 'Виды переводов',
        sections: [
          {
            title: 'Внутренние переводы',
            description: 'Переводы между счетами в нашем банке.',
            features: [
              'Мгновенное зачисление',
              'Бесплатные переводы',
              'Перевод по номеру телефона',
              'Перевод по номеру карты'
            ]
          },
          {
            title: 'Международные переводы',
            description: 'Переводы в другие банки и страны.',
            features: [
              'Поддержка основных валют',
              'Комиссия от 1%',
              'Срок зачисления: 1-3 дня',
              'Возможность отслеживания'
            ]
          }
        ]
      }
    }
  ];

  const handleCardPress = (content) => {
    navigation.navigate('InfoDetail', { content });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Полезная информация</Text>
        </View>
        <View style={styles.content}>
          {infoSections.map((section, index) => (
            <InfoCard
              key={index}
              title={section.title}
              icon={section.icon}
              onPress={() => handleCardPress(section.content)}
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