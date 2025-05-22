import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const BackgroundPattern = () => {
  const icons = [
    'wallet-outline',
    'cash-outline',
    'card-outline',
    'trending-up-outline',
    'calculator-outline',
    'pie-chart-outline',
  ];

  const renderPattern = () => {
    const rows = Math.ceil(height / 100) + 1;
    const cols = Math.ceil(width / 150) + 1;
    const pattern = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const isIcon = (i + j) % 2 === 0;
        pattern.push(
          isIcon ? (
            <Ionicons
              key={`${i}-${j}`}
              name={icons[(i + j) % icons.length]}
              size={32}
              style={[
                styles.patternText,
                {
                  transform: [{ rotate: '-45deg' }],
                  left: j * 150,
                  top: i * 100,
                },
              ]}
            />
          ) : (
            <Text
              key={`${i}-${j}`}
              style={[
                styles.patternText,
                {
                  transform: [{ rotate: '-45deg' }],
                  left: j * 150,
                  top: i * 100,
                },
              ]}
            >
              FinBix
            </Text>
          )
        );
      }
    }
    return pattern;
  };

  return <View style={styles.container}>{renderPattern()}</View>;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#3b5998',
    overflow: 'hidden',
  },
  patternText: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: 32,
    fontWeight: 'bold',
  },
}); 