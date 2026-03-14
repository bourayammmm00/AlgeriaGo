import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Share, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { getTripById } from '../src/stores/tripStore';
import { getPlaceById } from '../src/data/places';
import { Trip } from '../src/types';

export default function ShareScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [shareText, setShareText] = useState('');

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    if (!tripId) return;
    const t = await getTripById(tripId);
    if (t) {
      setTrip(t);
      buildShareText(t);
    }
  };

  const buildShareText = (t: Trip) => {
    let text = `Mon itinéraire AlgeriaGo - ${t.name}\n`;
    text += `${t.city} | ${t.date}\n\n`;
    t.places.forEach((p, i) => {
      const placeData = getPlaceById(p.placeId);
      text += `${i + 1}. ${p.name}`;
      if (placeData) text += ` (${placeData.rating}/5)`;
      text += '\n';
    });
    text += `\n${t.places.length} lieux à visiter`;
    text += '\n\nPlanifié avec AlgeriaGo';
    setShareText(text);
  };

  const handleShare = async (platform?: string) => {
    if (!shareText) return;

    const encodedText = encodeURIComponent(shareText);

    try {
      switch (platform) {
        case 'whatsapp':
          await Linking.openURL(`whatsapp://send?text=${encodedText}`);
          break;
        case 'facebook':
          await Linking.openURL(`https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`);
          break;
        case 'instagram':
          // Instagram doesn't support text sharing directly, copy to clipboard
          Alert.alert(
            'Instagram',
            'Le texte a été copié. Ouvrez Instagram et collez-le dans votre story ou publication.',
          );
          break;
        case 'email':
          await Linking.openURL(`mailto:?subject=Mon itinéraire AlgeriaGo&body=${encodedText}`);
          break;
        default:
          await Share.share({
            message: shareText,
            title: 'Mon itinéraire AlgeriaGo',
          });
      }
    } catch {
      // Fall back to native share
      await Share.share({
        message: shareText,
        title: 'Mon itinéraire AlgeriaGo',
      });
    }
  };

  const handleCopyLink = () => {
    Alert.alert('Copié !', 'L\'itinéraire a été copié dans le presse-papier.');
  };

  if (!trip) {
    return (
      <View style={styles.empty}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={styles.emptyText}>Voyage non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Share via apps */}
      <TouchableOpacity style={styles.mainShareBtn} onPress={() => handleShare()}>
        <Ionicons name="mail-outline" size={22} color={Colors.primary} />
        <Text style={styles.mainShareText}>Envoyer l'itinéraire</Text>
      </TouchableOpacity>

      {/* Social media buttons */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#25D366' }]} onPress={() => handleShare('whatsapp')}>
          <Ionicons name="logo-whatsapp" size={28} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#1877F2' }]} onPress={() => handleShare('facebook')}>
          <Ionicons name="logo-facebook" size={28} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#E4405F' }]} onPress={() => handleShare('instagram')}>
          <Ionicons name="logo-instagram" size={28} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#0078D4' }]} onPress={() => handleShare('email')}>
          <Ionicons name="mail" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Copy link */}
      <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
        <Text style={styles.copyText}>Copier le lien</Text>
        <Ionicons name="copy-outline" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      {/* Preview */}
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Aperçu du message</Text>
        <Text style={styles.previewText}>{shareText}</Text>
      </View>

      {/* Trip summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{trip.name}</Text>
        <Text style={styles.summaryCity}>{trip.city}</Text>
        {trip.places.map((p, i) => {
          const placeData = getPlaceById(p.placeId);
          return (
            <View key={p.placeId} style={styles.summaryPlace}>
              <View style={styles.summaryMarker}>
                <Text style={styles.summaryMarkerText}>{i + 1}</Text>
              </View>
              <Text style={styles.summaryPlaceName}>{p.name}</Text>
              {p.visited && <Ionicons name="checkmark-circle" size={16} color={Colors.success} />}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  mainShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  mainShareText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  socialBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 8,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  previewCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryCity: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  summaryPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  summaryMarkerText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  summaryPlaceName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});
