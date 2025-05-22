import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SPACING = width * 0.05;

const CardSlider = ({ cards, onCardPress }) => {
  const formatCardNumber = (number) => {
    if (!number) return 'N/A';
    const numStr = number.toString();
    return `**** **** **** ${numStr.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (balance === undefined || balance === null) return 'N/A';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(balance);
  };

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.cardSlider}
    >
      {!Array.isArray(cards) || cards.length === 0 ? (
        <View style={[styles.card, styles.emptyCard]}>
          <Text style={styles.emptyText}>Нет доступных карт</Text>
        </View>
      ) : (
        cards.map((card) => (
          card.isPlaceholder ? (
            <TouchableOpacity 
              key={card.id} 
              style={[styles.card, styles.createCardButton]}
              onPress={() => onCardPress && onCardPress(card)}
            >
              <Text style={styles.createCardText}>Создать карту</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              key={card.id} 
              style={styles.card}
              onPress={() => onCardPress && onCardPress(card)}
            >
              <Text style={styles.cardNumber}>
                {formatCardNumber(card.cardNumber)}
              </Text>
              <Text style={styles.cardBalance}>
                {formatBalance(card.balance)}
              </Text>
              <Text style={styles.cardHolder}>
                {card.holderName || 'N/A'}
              </Text>
            </TouchableOpacity>
          )
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardSlider: {
    paddingHorizontal: SPACING,
  },
  card: {
    width: CARD_WIDTH,
    height: 200,
    backgroundColor: '#28a745',
    borderRadius: 15,
    padding: 20,
    marginRight: SPACING,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyCard: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardHolder: {
    fontSize: 16,
    color: '#fff',
  },
  createCardButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CardSlider; 