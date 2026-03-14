import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import PlaceCard from '../../src/components/PlaceCard';
import { getCityByName, getPlacesByCity } from '../../src/data/places';
import { PlaceCategory } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const filterCategories: { key: PlaceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'attraction', label: 'Attractions' },
  { key: 'restaurant', label: 'Restaurants' },
  { key: 'plage', label: 'Plages' },
  { key: 'musee', label: 'Musées' },
  { key: 'parc', label: 'Parcs' },
  { key: 'mosque', label: 'Mosquées' },
];

export default function CityScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<PlaceCategory | 'all'>('all');

  const city = getCityByName(name || '');
  const cityPlaces = getPlacesByCity(name || '');

  const filteredPlaces = useMemo(() => {
    if (selectedFilter === 'all') return cityPlaces;
    return cityPlaces.filter(p => p.category === selectedFilter);
  }, [cityPlaces, selectedFilter]);

  if (!city) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Ville non trouvée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Explorer ${city.name}` }} />

      {/* Hero */}
      <Image source={{ uri: city.image }} style={styles.heroImage} />
      <View style={styles.heroOverlay}>
        <Text style={styles.heroTitle}>Explorer {city.name}</Text>
        <Text style={styles.heroDesc}>{city.description}</Text>
      </View>

      {/* Filters */}
      <FlatList
        data={filterCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === item.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(item.key)}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === item.key && styles.filterChipTextActive,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Places */}
      <FlatList
        data={filteredPlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlaceCard place={item} variant="vertical" />}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {filteredPlaces.length} lieu(x) trouvé(s)
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={40} color={Colors.textLight} />
            <Text style={styles.emptyText}>Aucun lieu dans cette catégorie</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 180,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    width: SCREEN_WIDTH,
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  resultCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
