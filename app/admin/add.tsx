import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import StarRating from '../../src/components/StarRating';
import { Place, PlaceCategory } from '../../src/types';
import { addCustomPlace, updateCustomPlace, getCustomPlaces, generatePlaceId } from '../../src/stores/adminStore';

const categoryOptions: { key: PlaceCategory; label: string; icon: string }[] = [
  { key: 'attraction', label: 'Attraction', icon: 'compass' },
  { key: 'restaurant', label: 'Restaurant', icon: 'restaurant' },
  { key: 'hotel', label: 'Hôtel', icon: 'bed' },
  { key: 'plage', label: 'Plage', icon: 'water' },
  { key: 'musee', label: 'Musée', icon: 'library' },
  { key: 'mosque', label: 'Mosquée', icon: 'moon' },
  { key: 'parc', label: 'Parc', icon: 'leaf' },
  { key: 'marche', label: 'Marché', icon: 'basket' },
];

export default function AddPlaceScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const router = useRouter();
  const isEditing = !!editId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('attraction');
  const [city, setCity] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [rating, setRating] = useState(4);
  const [image, setImage] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [phone, setPhone] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (editId) loadExisting();
  }, [editId]);

  const loadExisting = async () => {
    const places = await getCustomPlaces();
    const place = places.find(p => p.id === editId);
    if (place) {
      setName(place.name);
      setDescription(place.description);
      setCategory(place.category);
      setCity(place.city);
      setWilaya(place.wilaya);
      setAddress(place.address);
      setLatitude(String(place.latitude));
      setLongitude(String(place.longitude));
      setRating(place.rating);
      setImage(place.image);
      setOpeningHours(place.openingHours || '');
      setPriceRange(place.priceRange || '');
      setPhone(place.phone || '');
      setTags(place.tags.join(', '));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Erreur', 'Le nom est obligatoire.'); return; }
    if (!city.trim()) { Alert.alert('Erreur', 'La ville est obligatoire.'); return; }
    if (!wilaya.trim()) { Alert.alert('Erreur', 'La wilaya est obligatoire.'); return; }
    if (!latitude || !longitude) { Alert.alert('Erreur', 'Les coordonnées GPS sont obligatoires.'); return; }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) { Alert.alert('Erreur', 'Coordonnées GPS invalides.'); return; }

    const place: Place = {
      id: editId || generatePlaceId(),
      name: name.trim(),
      description: description.trim(),
      category,
      city: city.trim(),
      wilaya: wilaya.trim(),
      latitude: lat,
      longitude: lng,
      rating,
      reviewCount: 0,
      image: image.trim() || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
      images: [],
      address: address.trim(),
      openingHours: openingHours.trim() || undefined,
      priceRange: priceRange.trim() || undefined,
      phone: phone.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (isEditing) {
      await updateCustomPlace(place);
      Alert.alert('Modifié', `"${place.name}" a été mis à jour.`);
    } else {
      await addCustomPlace(place);
      Alert.alert('Ajouté', `"${place.name}" a été ajouté avec succès.`);
    }
    router.back();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Informations de base</Text>

        <Text style={styles.label}>Nom du lieu *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName}
          placeholder="Ex: Mosquée Ketchaoua" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description}
          onChangeText={setDescription} placeholder="Décrivez ce lieu..."
          placeholderTextColor={Colors.textLight} multiline numberOfLines={4} textAlignVertical="top" />

        <Text style={styles.label}>Catégorie *</Text>
        <View style={styles.categoryGrid}>
          {categoryOptions.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryItem, category === cat.key && styles.categoryItemActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={category === cat.key ? Colors.white : Colors.primary}
              />
              <Text style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Note</Text>
        <View style={styles.ratingContainer}>
          <StarRating rating={rating} size={32} editable onRatingChange={setRating} />
          <Text style={styles.ratingValue}>{rating}/5</Text>
        </View>

        <Text style={styles.sectionTitle}>Localisation</Text>

        <Text style={styles.label}>Ville *</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity}
          placeholder="Ex: Alger" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Wilaya *</Text>
        <TextInput style={styles.input} value={wilaya} onChangeText={setWilaya}
          placeholder="Ex: Alger" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Adresse</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress}
          placeholder="Ex: Place des Martyrs, Alger" placeholderTextColor={Colors.textLight} />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Latitude *</Text>
            <TextInput style={styles.input} value={latitude} onChangeText={setLatitude}
              placeholder="36.7853" placeholderTextColor={Colors.textLight} keyboardType="numeric" />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Longitude *</Text>
            <TextInput style={styles.input} value={longitude} onChangeText={setLongitude}
              placeholder="3.0606" placeholderTextColor={Colors.textLight} keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Détails supplémentaires</Text>

        <Text style={styles.label}>URL de l'image</Text>
        <TextInput style={styles.input} value={image} onChangeText={setImage}
          placeholder="https://..." placeholderTextColor={Colors.textLight} autoCapitalize="none" />

        <Text style={styles.label}>Horaires d'ouverture</Text>
        <TextInput style={styles.input} value={openingHours} onChangeText={setOpeningHours}
          placeholder="Ex: 9h00 - 18h00" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Fourchette de prix</Text>
        <TextInput style={styles.input} value={priceRange} onChangeText={setPriceRange}
          placeholder="Ex: 500 - 1500 DA" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone}
          placeholder="Ex: +213 21 XX XX XX" placeholderTextColor={Colors.textLight} keyboardType="phone-pad" />

        <Text style={styles.label}>Tags (séparés par des virgules)</Text>
        <TextInput style={styles.input} value={tags} onChangeText={setTags}
          placeholder="Ex: Historique, UNESCO, Architecture" placeholderTextColor={Colors.textLight} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name={isEditing ? 'checkmark-circle' : 'add-circle'} size={22} color={Colors.white} />
          <Text style={styles.saveBtnText}>
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter le lieu'}
          </Text>
        </TouchableOpacity>

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
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  categoryItemActive: {
    backgroundColor: Colors.primary,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
  },
  categoryLabelActive: {
    color: Colors.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  saveBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
});
