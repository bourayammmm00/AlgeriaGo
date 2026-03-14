import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { Colors } from '../../src/constants/colors';
import StarRating from '../../src/components/StarRating';
import CategoryBadge from '../../src/components/CategoryBadge';
import ReviewSection from '../../src/components/ReviewSection';
import { getPlaceById } from '../../src/data/places';
import { getTrips, addPlaceToTrip } from '../../src/stores/tripStore';
import { Place, Trip } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (id) {
      const p = getPlaceById(id);
      setPlace(p || null);
    }
    loadTrips();
  }, [id]);

  const loadTrips = async () => {
    const data = await getTrips();
    setTrips(data);
  };

  const handleAddToTrip = () => {
    if (!place) return;
    if (trips.length === 0) {
      Alert.alert(
        'Pas de voyage',
        'Créez d\'abord un voyage dans l\'onglet Planifier.',
        [{ text: 'OK' }]
      );
      return;
    }

    const options = trips.map(t => t.name);
    Alert.alert(
      'Ajouter au voyage',
      'Choisissez un voyage :',
      [
        ...trips.map(trip => ({
          text: trip.name,
          onPress: async () => {
            await addPlaceToTrip(trip.id, {
              placeId: place.id,
              name: place.name,
              order: 0,
              estimatedDuration: 60,
              visited: false,
            });
            Alert.alert('Ajouté !', `${place.name} a été ajouté à "${trip.name}".`);
          },
        })),
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const openInGoogleMaps = () => {
    if (!place) return;
    const { latitude, longitude, name, address } = place;
    const label = encodeURIComponent(name);
    const query = encodeURIComponent(address || name);

    // Try Google Maps app first, fallback to web
    const googleMapsUrl = Platform.select({
      ios: `comgooglemaps://?q=${query}&center=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`,
    });

    const webFallback = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.canOpenURL(googleMapsUrl).then((supported) => {
      if (supported) {
        Linking.openURL(googleMapsUrl);
      } else {
        Linking.openURL(webFallback);
      }
    }).catch(() => {
      Linking.openURL(webFallback);
    });
  };

  const handleShare = async () => {
    if (!place) return;
    try {
      const message = `Découvrez ${place.name} à ${place.city} sur AlgeriaGo !\n\n${place.description}\n\nNote: ${place.rating}/5 (${place.reviewCount} avis)\n📍 ${place.address}`;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(place.image, {
          dialogTitle: `Partager ${place.name}`,
          mimeType: 'text/plain',
          UTI: 'public.plain-text',
        });
      } else {
        Alert.alert('Partager', message);
      }
    } catch {
      // Sharing cancelled
    }
  };

  if (!place) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={styles.notFoundText}>Lieu non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Image */}
      <Image source={{ uri: place.image }} style={styles.heroImage} />
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.white} />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <Text style={styles.name}>{place.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={Colors.primary} />
              <Text style={styles.city}>{place.city}, {place.wilaya}</Text>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleAddToTrip}>
              <Ionicons name="bookmark-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <StarRating rating={place.rating} size={20} />
          <Text style={styles.ratingValue}>{place.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({place.reviewCount} avis)</Text>
        </View>

        {/* Category & Tags */}
        <View style={styles.tagsRow}>
          <CategoryBadge category={place.category} size="medium" />
          {place.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.description}>{place.description}</Text>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          {place.address && (
            <TouchableOpacity style={styles.infoCard} onPress={openInGoogleMaps} activeOpacity={0.7}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <View style={[styles.infoContent, { flex: 1 }]}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={[styles.infoValue, { color: Colors.primary }]}>{place.address}</Text>
              </View>
              <Ionicons name="navigate-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}
          {place.openingHours && (
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Horaires</Text>
                <Text style={styles.infoValue}>{place.openingHours}</Text>
              </View>
            </View>
          )}
          {place.priceRange && (
            <View style={styles.infoCard}>
              <Ionicons name="cash-outline" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Prix</Text>
                <Text style={styles.infoValue}>{place.priceRange}</Text>
              </View>
            </View>
          )}
          {place.phone && (
            <View style={styles.infoCard}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{place.phone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.addToTripBtn} onPress={handleAddToTrip}>
            <Ionicons name="add-circle" size={22} color={Colors.white} />
            <Text style={styles.addToTripText}>Ajouter à mon voyage</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleMapsBtn} onPress={openInGoogleMaps}>
            <Ionicons name="navigate" size={20} color={Colors.white} />
            <Text style={styles.googleMapsText}>Voir sur Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews */}
        <ReviewSection placeId={place.id} />

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  titleCol: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  city: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  reviewCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  infoCards: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 10,
  },
  infoContent: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 2,
  },
  actionRow: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  addToTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addToTripText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  googleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 12,
  },
  googleMapsText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});
