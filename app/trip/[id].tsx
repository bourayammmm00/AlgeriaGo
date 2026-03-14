import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Colors } from '../../src/constants/colors';
import { getTripById } from '../../src/stores/tripStore';
import { getPlaceById } from '../../src/data/places';
import { Trip, Place } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function estimateTravelTime(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distKm = R * c;
  // Assume average speed of 30 km/h in city
  return Math.round((distKm / 30) * 60);
}

export default function TripMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripPlaces, setTripPlaces] = useState<(Place & { order: number })[]>([]);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    if (!id) return;
    const t = await getTripById(id);
    if (t) {
      setTrip(t);
      const resolved = t.places
        .sort((a, b) => a.order - b.order)
        .map(tp => {
          const place = getPlaceById(tp.placeId);
          return place ? { ...place, order: tp.order } : null;
        })
        .filter(Boolean) as (Place & { order: number })[];
      setTripPlaces(resolved);
    }
  };

  if (!trip || tripPlaces.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="map-outline" size={60} color={Colors.textLight} />
        <Text style={styles.emptyText}>Aucun lieu dans ce voyage</Text>
        <Text style={styles.emptySubtext}>Ajoutez des lieux pour voir l'itinéraire</Text>
      </View>
    );
  }

  const coordinates = tripPlaces.map(p => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  const travelTimes: number[] = [];
  for (let i = 0; i < tripPlaces.length - 1; i++) {
    travelTimes.push(
      estimateTravelTime(
        tripPlaces[i].latitude, tripPlaces[i].longitude,
        tripPlaces[i + 1].latitude, tripPlaces[i + 1].longitude
      )
    );
  }

  const totalDuration = travelTimes.reduce((a, b) => a + b, 0) +
    trip.places.reduce((a, b) => a + b.estimatedDuration, 0);

  const centerLat = tripPlaces.reduce((sum, p) => sum + p.latitude, 0) / tripPlaces.length;
  const centerLng = tripPlaces.reduce((sum, p) => sum + p.longitude, 0) / tripPlaces.length;

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {tripPlaces.map((place, index) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            description={`${LETTERS[index]} - ${place.name}`}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Text style={styles.markerText}>{LETTERS[index]}</Text>
              </View>
              {index < travelTimes.length && (
                <View style={styles.travelBadge}>
                  <Text style={styles.travelTime}>{travelTimes[index]} min</Text>
                </View>
              )}
            </View>
          </Marker>
        ))}
        <Polyline
          coordinates={coordinates}
          strokeColor={Colors.primary}
          strokeWidth={3}
        />
      </MapView>

      {/* Itinerary bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {tripPlaces.map((place, index) => (
            <View key={place.id}>
              <View style={styles.stopRow}>
                <View style={[styles.stopMarker, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.stopLetter}>{LETTERS[index]}</Text>
                </View>
                <View style={styles.stopInfo}>
                  <Text style={styles.stopName}>{place.name}</Text>
                  <Text style={styles.stopCategory}>{place.category}</Text>
                </View>
              </View>
              {index < travelTimes.length && (
                <View style={styles.travelRow}>
                  <View style={styles.travelLine} />
                  <Ionicons name="car-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.travelText}>{travelTimes[index]} min de trajet</Text>
                </View>
              )}
            </View>
          ))}

          <View style={styles.totalRow}>
            <Ionicons name="time" size={18} color={Colors.primary} />
            <Text style={styles.totalText}>
              Durée Totale : {totalDuration} min
            </Text>
            <TouchableOpacity onPress={() => router.push({
              pathname: '/share',
              params: { tripId: trip.id },
            })}>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  travelBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  travelTime: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: 300,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stopMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopLetter: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  stopInfo: {
    marginLeft: 12,
  },
  stopName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  stopCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  travelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingVertical: 4,
  },
  travelLine: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
    marginRight: 10,
  },
  travelText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  totalText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 6,
  },
});
