import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import StarRating from './StarRating';
import CategoryBadge from './CategoryBadge';
import { Place } from '../types';

interface PlaceCardProps {
  place: Place;
  variant?: 'horizontal' | 'vertical' | 'compact';
  onAddToTrip?: (place: Place) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PlaceCard({ place, variant = 'vertical', onAddToTrip }: PlaceCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/place/${place.id}`);
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.8}>
        <Image source={{ uri: place.image }} style={styles.compactImage} />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{place.name}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={place.rating} size={12} />
            <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
          </View>
          <CategoryBadge category={place.category} />
        </View>
        {onAddToTrip && (
          <TouchableOpacity style={styles.addBtn} onPress={() => onAddToTrip(place)}>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={handlePress} activeOpacity={0.8}>
        <Image source={{ uri: place.image }} style={styles.horizontalImage} />
        <Text style={styles.horizontalName} numberOfLines={1}>{place.name}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={place.rating} size={12} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.verticalCard} onPress={handlePress} activeOpacity={0.8}>
      <Image source={{ uri: place.image }} style={styles.verticalImage} />
      <View style={styles.verticalInfo}>
        <Text style={styles.verticalName} numberOfLines={1}>{place.name}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={place.rating} size={14} />
          <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({place.reviewCount})</Text>
        </View>
        <View style={styles.metaRow}>
          <CategoryBadge category={place.category} />
          {onAddToTrip && (
            <TouchableOpacity onPress={() => onAddToTrip(place)}>
              <Ionicons name="bookmark-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Horizontal card (scroll item)
  horizontalCard: {
    width: SCREEN_WIDTH * 0.35,
    marginRight: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  horizontalImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  horizontalName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 8,
    paddingTop: 6,
  },

  // Vertical card (list item)
  verticalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  verticalImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  verticalInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  verticalName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },

  // Compact card (trip list item)
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  compactInfo: {
    flex: 1,
    marginLeft: 10,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 3,
  },

  // Shared styles
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addBtn: {
    padding: 4,
  },
});
