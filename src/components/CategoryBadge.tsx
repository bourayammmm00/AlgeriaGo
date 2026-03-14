import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { PlaceCategory } from '../types';

const categoryConfig: Record<PlaceCategory, { label: string; icon: string; color: string }> = {
  attraction: { label: 'Attractions', icon: 'compass', color: '#3B82F6' },
  restaurant: { label: 'Restaurant', icon: 'restaurant', color: '#EF4444' },
  hotel: { label: 'Hôtel', icon: 'bed', color: '#8B5CF6' },
  plage: { label: 'Plage', icon: 'water', color: '#06B6D4' },
  musee: { label: 'Musée', icon: 'library', color: '#F59E0B' },
  mosque: { label: 'Mosquée', icon: 'moon', color: '#10B981' },
  parc: { label: 'Parc', icon: 'leaf', color: '#22C55E' },
  marche: { label: 'Marché', icon: 'basket', color: '#F97316' },
};

interface CategoryBadgeProps {
  category: PlaceCategory;
  size?: 'small' | 'medium';
}

export default function CategoryBadge({ category, size = 'small' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '15' }, isSmall && styles.badgeSmall]}>
      <Ionicons name={config.icon as any} size={isSmall ? 12 : 14} color={config.color} />
      <Text style={[styles.label, { color: config.color }, isSmall && styles.labelSmall]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  labelSmall: {
    fontSize: 11,
  },
});
