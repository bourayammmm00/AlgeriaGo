import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import SearchBar from '../../src/components/SearchBar';
import PlaceCard from '../../src/components/PlaceCard';
import StarRating from '../../src/components/StarRating';
import { places, cities, getNearbyPlaces, searchPlaces } from '../../src/data/places';
import { Place, City } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [restaurants, setRestaurants] = useState<Place[]>([]);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearbyPlaces();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      setSearchResults(searchPlaces(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadNearbyPlaces = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let nearby: Place[];

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        nearby = getNearbyPlaces(location.coords.latitude, location.coords.longitude, 100);
      } else {
        // Default to Alger
        nearby = getNearbyPlaces(36.7538, 3.0588, 100);
      }

      setNearbyPlaces(nearby.filter(p => p.category !== 'restaurant').slice(0, 10));
      setRestaurants(nearby.filter(p => p.category === 'restaurant').slice(0, 10));
    } catch {
      // Fallback to all places
      setNearbyPlaces(places.filter(p => p.category !== 'restaurant').slice(0, 10));
      setRestaurants(places.filter(p => p.category === 'restaurant').slice(0, 10));
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      const cityMatch = cities.find(c =>
        c.name.toLowerCase() === searchQuery.toLowerCase()
      );
      if (cityMatch) {
        router.push(`/city/${cityMatch.name}`);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Show search results when searching
  if (searchQuery.length > 1 && searchResults.length > 0) {
    return (
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
          placeholder="Rechercher une ville ou un lieu"
        />
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceCard place={item} variant="vertical" />}
          contentContainerStyle={{ paddingTop: 8 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Rechercher une ville ou un lieu"
      />

      {/* Découvrir à Proximité */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Découvrir à Proximité</Text>
          <TouchableOpacity onPress={() => router.push('/explorer')}>
            <Text style={styles.seeAll}>Voir tout {'>'}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={nearbyPlaces.slice(0, 6)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingLeft: 16 }}
          renderItem={({ item }) => <PlaceCard place={item} variant="horizontal" />}
        />
      </View>

      {/* Villes populaires */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Villes Populaires</Text>
        </View>
        <FlatList
          data={cities.slice(0, 6)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingLeft: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cityCard}
              onPress={() => router.push(`/city/${item.name}`)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.image }} style={styles.cityImage} />
              <View style={styles.cityOverlay}>
                <Text style={styles.cityName}>{item.name}</Text>
                <Text style={styles.cityCount}>{item.placeCount} lieux</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Restaurants Populaires */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Restaurants Populaires</Text>
          <TouchableOpacity onPress={() => router.push('/explorer')}>
            <Text style={styles.seeAll}>Voir tout {'>'}</Text>
          </TouchableOpacity>
        </View>
        {restaurants.map((restaurant) => (
          <PlaceCard key={restaurant.id} place={restaurant} variant="vertical" />
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  cityCard: {
    width: 140,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cityImage: {
    width: '100%',
    height: '100%',
  },
  cityOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  cityName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cityCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
});
