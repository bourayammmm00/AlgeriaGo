import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Trip, TripPlace } from '../../src/types';
import { getTrips, saveTrip, deleteTrip, togglePlaceVisited, removePlaceFromTrip, generateTripId } from '../../src/stores/tripStore';
import { getPlaceById } from '../../src/data/places';
import StarRating from '../../src/components/StarRating';

export default function PlanifierScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripCity, setNewTripCity] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const loadTrips = async () => {
    const data = await getTrips();
    setTrips(data);
    if (data.length > 0 && !selectedTrip) {
      setSelectedTrip(data[0]);
    } else if (selectedTrip) {
      const updated = data.find(t => t.id === selectedTrip.id);
      setSelectedTrip(updated || data[0] || null);
    }
  };

  const handleCreateTrip = async () => {
    if (!newTripName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour votre voyage.');
      return;
    }
    const trip: Trip = {
      id: generateTripId(),
      name: newTripName.trim(),
      city: newTripCity.trim() || 'Algérie',
      date: new Date().toISOString().split('T')[0],
      places: [],
      createdAt: new Date().toISOString(),
    };
    await saveTrip(trip);
    setNewTripName('');
    setNewTripCity('');
    setShowNewTrip(false);
    setSelectedTrip(trip);
    loadTrips();
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      'Supprimer le voyage',
      'Êtes-vous sûr de vouloir supprimer ce voyage ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteTrip(tripId);
            if (selectedTrip?.id === tripId) {
              setSelectedTrip(null);
            }
            loadTrips();
          },
        },
      ]
    );
  };

  const handleToggleVisited = async (placeId: string) => {
    if (!selectedTrip) return;
    const updated = await togglePlaceVisited(selectedTrip.id, placeId);
    if (updated) setSelectedTrip(updated);
    loadTrips();
  };

  const handleRemovePlace = async (placeId: string) => {
    if (!selectedTrip) return;
    const updated = await removePlaceFromTrip(selectedTrip.id, placeId);
    if (updated) setSelectedTrip(updated);
    loadTrips();
  };

  const renderTripPlace = ({ item }: { item: TripPlace }) => {
    const placeData = getPlaceById(item.placeId);
    return (
      <View style={styles.tripPlaceCard}>
        <TouchableOpacity
          style={[styles.checkbox, item.visited && styles.checkboxChecked]}
          onPress={() => handleToggleVisited(item.placeId)}
        >
          {item.visited && <Ionicons name="checkmark" size={16} color={Colors.white} />}
        </TouchableOpacity>
        <Image
          source={{ uri: placeData?.image || 'https://via.placeholder.com/60' }}
          style={styles.tripPlaceImage}
        />
        <View style={styles.tripPlaceInfo}>
          <Text style={[styles.tripPlaceName, item.visited && styles.visited]}>
            {item.name}
          </Text>
          {placeData && (
            <View style={styles.ratingRow}>
              <StarRating rating={placeData.rating} size={12} />
              <Text style={styles.categoryText}>{placeData.category}</Text>
            </View>
          )}
          <Text style={styles.durationText}>
            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
            {' '}{item.estimatedDuration} min
          </Text>
        </View>
        <View style={styles.tripPlaceActions}>
          <TouchableOpacity
            onPress={() => placeData && router.push(`/place/${placeData.id}`)}
            style={styles.actionBtn}
          >
            <Ionicons name="eye-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRemovePlace(item.placeId)}
            style={styles.actionBtn}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Trip selector */}
      <View style={styles.tripSelector}>
        <FlatList
          data={trips}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tripTab, selectedTrip?.id === item.id && styles.tripTabActive]}
              onPress={() => setSelectedTrip(item)}
              onLongPress={() => handleDeleteTrip(item.id)}
            >
              <Text style={[styles.tripTabText, selectedTrip?.id === item.id && styles.tripTabTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <TouchableOpacity style={styles.addTripBtn} onPress={() => setShowNewTrip(true)}>
              <Ionicons name="add" size={22} color={Colors.primary} />
            </TouchableOpacity>
          }
        />
      </View>

      {/* New trip form */}
      {showNewTrip && (
        <View style={styles.newTripForm}>
          <TextInput
            style={styles.input}
            placeholder="Nom du voyage (ex: Vacances Oran)"
            value={newTripName}
            onChangeText={setNewTripName}
            placeholderTextColor={Colors.textLight}
          />
          <TextInput
            style={styles.input}
            placeholder="Ville (optionnel)"
            value={newTripCity}
            onChangeText={setNewTripCity}
            placeholderTextColor={Colors.textLight}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNewTrip(false)}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateTrip}>
              <Text style={styles.createBtnText}>Créer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Selected trip content */}
      {selectedTrip ? (
        <View style={styles.tripContent}>
          <View style={styles.tripHeader}>
            <View>
              <Text style={styles.tripTitle}>{selectedTrip.name}</Text>
              <Text style={styles.tripCity}>{selectedTrip.city} - {selectedTrip.date}</Text>
            </View>
            <View style={styles.tripActions}>
              <TouchableOpacity
                style={styles.mapBtn}
                onPress={() => router.push(`/trip/${selectedTrip.id}`)}
              >
                <Ionicons name="navigate" size={18} color={Colors.white} />
                <Text style={styles.mapBtnText}>Voir l'itinéraire</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => router.push({
                  pathname: '/share',
                  params: { tripId: selectedTrip.id },
                })}
              >
                <Ionicons name="share-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.placesCount}>
            {selectedTrip.places.length} lieu(x) - {selectedTrip.places.filter(p => p.visited).length} visité(s)
          </Text>

          {selectedTrip.places.length === 0 ? (
            <View style={styles.emptyTrip}>
              <Ionicons name="map-outline" size={60} color={Colors.textLight} />
              <Text style={styles.emptyText}>Aucun lieu ajouté</Text>
              <Text style={styles.emptySubtext}>
                Explorez les lieux et ajoutez-les à votre voyage !
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.push('/explorer')}
              >
                <Ionicons name="compass" size={20} color={Colors.white} />
                <Text style={styles.exploreBtnText}>Explorer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={selectedTrip.places.sort((a, b) => a.order - b.order)}
              renderItem={renderTripPlace}
              keyExtractor={(item) => item.placeId}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      ) : (
        <View style={styles.noTrip}>
          <Ionicons name="airplane-outline" size={60} color={Colors.textLight} />
          <Text style={styles.noTripText}>Pas de voyage planifié</Text>
          <Text style={styles.noTripSubtext}>Créez votre premier voyage !</Text>
          <TouchableOpacity style={styles.createFirstBtn} onPress={() => setShowNewTrip(true)}>
            <Ionicons name="add-circle" size={22} color={Colors.white} />
            <Text style={styles.createFirstBtnText}>Créer un voyage</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tripSelector: {
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tripTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  tripTabActive: {
    backgroundColor: Colors.primary,
  },
  tripTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tripTabTextActive: {
    color: Colors.white,
  },
  addTripBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  newTripForm: {
    backgroundColor: Colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 10,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  createBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  createBtnText: {
    color: Colors.white,
    fontWeight: '700',
  },
  tripContent: {
    flex: 1,
  },
  tripHeader: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  tripCity: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tripActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
  },
  mapBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  shareBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placesCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tripPlaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tripPlaceImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  tripPlaceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  tripPlaceName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  visited: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  durationText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tripPlaceActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
  },
  emptyTrip: {
    alignItems: 'center',
    paddingVertical: 50,
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  exploreBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  noTrip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  noTripText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 16,
  },
  noTripSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 6,
  },
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  createFirstBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
});
