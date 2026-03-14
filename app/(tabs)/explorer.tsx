import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import SearchBar from '../../src/components/SearchBar';
import PlaceCard from '../../src/components/PlaceCard';
import { places, cities, searchPlaces, getPlacesByCategory, refreshCustomPlaces, getAllPlaces } from '../../src/data/places';
import { PlaceCategory } from '../../src/types';

const categories: { key: PlaceCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'Tout', icon: 'apps' },
  { key: 'attraction', label: 'Attractions', icon: 'compass' },
  { key: 'restaurant', label: 'Restaurants', icon: 'restaurant' },
  { key: 'plage', label: 'Plages', icon: 'water' },
  { key: 'musee', label: 'Musées', icon: 'library' },
  { key: 'parc', label: 'Parcs', icon: 'leaf' },
  { key: 'mosque', label: 'Mosquées', icon: 'moon' },
  { key: 'marche', label: 'Marchés', icon: 'basket' },
];

export default function ExplorerScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cities' | 'places'>('cities');
  const [allPlaces, setAllPlaces] = useState(getAllPlaces());

  useEffect(() => {
    refreshCustomPlaces().then(() => setAllPlaces(getAllPlaces()));
  }, []);

  const filteredPlaces = useMemo(() => {
    let results = searchQuery.length > 1 ? searchPlaces(searchQuery) : allPlaces;
    if (selectedCategory !== 'all') {
      results = results.filter(p => p.category === selectedCategory);
    }
    return results;
  }, [searchQuery, selectedCategory]);

  const filteredCities = useMemo(() => {
    if (searchQuery.length > 1) {
      return cities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.wilaya.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return cities;
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      const cityMatch = cities.find(c =>
        c.name.toLowerCase() === searchQuery.toLowerCase()
      );
      if (cityMatch) {
        router.push(`/city/${cityMatch.name}`);
      } else {
        setViewMode('places');
      }
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Rechercher une ville ou un lieu..."
      />

      {/* View mode toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'cities' && styles.toggleActive]}
          onPress={() => setViewMode('cities')}
        >
          <Text style={[styles.toggleText, viewMode === 'cities' && styles.toggleTextActive]}>
            Villes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'places' && styles.toggleActive]}
          onPress={() => setViewMode('places')}
        >
          <Text style={[styles.toggleText, viewMode === 'places' && styles.toggleTextActive]}>
            Lieux
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'places' && (
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.key && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={selectedCategory === item.key ? Colors.white : Colors.primary}
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === item.key && styles.categoryChipTextActive,
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {viewMode === 'cities' ? (
        <FlatList
          data={filteredCities}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cityCard}
              onPress={() => router.push(`/city/${item.name}`)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.image }} style={styles.cityImage} />
              <View style={styles.cityInfo}>
                <Text style={styles.cityName}>{item.name}</Text>
                <Text style={styles.cityWilaya}>{item.wilaya}</Text>
                <Text style={styles.cityDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cityMeta}>
                  <Ionicons name="location" size={14} color={Colors.primary} />
                  <Text style={styles.cityCount}>{item.placeCount} lieux à découvrir</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <PlaceCard place={item} variant="vertical" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.border,
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  cityCard: {
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
  cityImage: {
    width: 110,
    height: 120,
  },
  cityInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  cityWilaya: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cityDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  cityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityCount: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});
