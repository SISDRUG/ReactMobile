import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { bankService } from '../services/bankService';

export const TransferScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [amount, setAmount] = useState('');
  const [recipientCard, setRecipientCard] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await bankService.getCards();
      setCards(response.content);
      if (response.content.length > 0) {
        setSelectedCard(response.content[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedCard || !amount || !recipientCard) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await bankService.createOperation({
        cardId: selectedCard.id,
        value: parseFloat(amount),
        recipientDetails: recipientCard,
        description,
        operationType: 'TRANSFER',
        status: 'PENDING',
      });

      Alert.alert('Success', 'Transfer initiated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to process transfer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Make a Transfer</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>From Card</Text>
        <View style={styles.cardSelector}>
          {cards.map(card => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.cardOption,
                selectedCard?.id === card.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedCard(card)}
            >
              <Text style={styles.cardNumber}>
                {`**** **** **** ${card.cardNumber.slice(-4)}`}
              </Text>
              <Text style={styles.cardBalance}>
                {card.balance} {card.currency.curAbbreviation}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>To Card Number</Text>
        <TextInput
          style={styles.input}
          value={recipientCard}
          onChangeText={setRecipientCard}
          placeholder="Enter recipient card number"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter transfer description"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.transferButton}
          onPress={handleTransfer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.transferButtonText}>Make Transfer</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardSelector: {
    marginBottom: 20,
  },
  cardOption: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardBalance: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  transferButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  transferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 