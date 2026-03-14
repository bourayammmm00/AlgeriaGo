import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import CategoryBadge from '../../src/components/CategoryBadge';
import StarRating from '../../src/components/StarRating';
import { Place } from '../../src/types';
import { getCustomPlaces, deleteCustomPlace, verifyAdminPin } from '../../src/stores/adminStore';

export default function AdminScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (authenticated) loadPlaces();
    }, [authenticated])
  );

  const loadPlaces = async () => {
    const data = await getCustomPlaces();
    setPlaces(data);
  };

  const handleLogin = async () => {
    const valid = await verifyAdminPin(pinInput);
    if (valid) {
      setAuthenticated(true);
      loadPlaces();
    } else {
      Alert.alert('Erreur', 'Code PIN incorrect.');
    }
    setPinInput('');
  };

  const handleDelete = (place: Place) => {
    Alert.alert(
      'Supprimer',
      `Supprimer "${place.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteCustomPlace(place.id);
            loadPlaces();
          },
        },
      ]
    );
  };

  if (!authenticated) {
    return (
      <View style={styles.loginContainer}>
        <Ionicons name="shield-checkmark" size={60} color={Colors.primary} />
        <Text style={styles.loginTitle}>Mode Admin</Text>
        <Text style={styles.loginSubtext}>Entrez le code PIN pour accéder</Text>
        <TextInput
          style={styles.pinInput}
          value={pinInput}
          onChangeText={setPinInput}
          placeholder="Code PIN"
          placeholderTextColor={Colors.textLight}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={8}
        />
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Accéder</Text>
        </TouchableOpacity>
        <Text style={styles.hintText}>PIN par défaut : 1234</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header actions */}
      <View style={styles.headerActions}>
        <Text style={styles.countText}>{places.length} lieu(x) ajouté(s)</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/admin/add')}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.addBtnText}>Ajouter un lieu</Text>
        </TouchableOpacity>
      </View>

      {/* Change PIN */}
      <TouchableOpacity
        style={styles.pinBtn}
        onPress={() => router.push('/admin/settings')}
      >
        <Ionicons name="key-outline" size={18} color={Colors.primary} />
        <Text style={styles.pinBtnText}>Changer le code PIN</Text>
      </TouchableOpacity>

      {/* Places list */}
      {places.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="add-circle-outline" size={60} color={Colors.textLight} />
          <Text style={styles.emptyText}>Aucun lieu personnalisé</Text>
          <Text style={styles.emptySubtext}>Ajoutez vos propres lieux touristiques</Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.placeCard}>
              <Image source={{ uri: item.image }} style={styles.placeImage} />
              <View style={styles.placeInfo}>
                <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.placeCity}>{item.city}, {item.wilaya}</Text>
                <View style={styles.placeRow}>
                  <CategoryBadge category={item.category} />
                  <StarRating rating={item.rating} size={12} />
                </View>
              </View>
              <View style={styles.placeActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push({
                    pathname: '/admin/add',
                    params: { editId: item.id },
                  })}
                >
                  <Ionicons name="create-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 30,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 16,
  },
  loginSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 24,
  },
  pinInput: {
    width: '100%',
    maxWidth: 250,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    textAlign: 'center',
    color: Colors.text,
    letterSpacing: 8,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  countText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  pinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pinBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
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
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeInfo: {
    flex: 1,
    marginLeft: 10,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  placeCity: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: 2,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  placeActions: {
    flexDirection: 'column',
    gap: 6,
  },
  editBtn: {
    padding: 6,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: Colors.error + '10',
    borderRadius: 8,
  },
});
