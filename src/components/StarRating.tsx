import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface StarRatingProps {
  rating: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({ rating, size = 16, editable = false, onRatingChange }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        const iconName = filled ? 'star' : half ? 'star-half' : 'star-outline';

        if (editable) {
          return (
            <TouchableOpacity key={star} onPress={() => onRatingChange?.(star)} activeOpacity={0.7}>
              <Ionicons name={iconName} size={size} color={Colors.gold} style={styles.star} />
            </TouchableOpacity>
          );
        }

        return (
          <Ionicons key={star} name={iconName} size={size} color={Colors.gold} style={styles.star} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});
