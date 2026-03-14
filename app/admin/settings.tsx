import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { getAdminPin, setAdminPin } from '../../src/stores/adminStore';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleChangePin = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      Alert.alert('Erreur', 'Remplissez tous les champs.');
      return;
    }

    const stored = await getAdminPin();
    if (currentPin !== stored) {
      Alert.alert('Erreur', 'Le code PIN actuel est incorrect.');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Erreur', 'Les nouveaux codes PIN ne correspondent pas.');
      return;
    }

    if (newPin.length < 4) {
      Alert.alert('Erreur', 'Le code PIN doit avoir au moins 4 caractères.');
      return;
    }

    await setAdminPin(newPin);
    Alert.alert('Succès', 'Le code PIN a été modifié.');
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="key" size={40} color={Colors.primary} style={styles.icon} />
        <Text style={styles.title}>Changer le code PIN</Text>

        <Text style={styles.label}>Code PIN actuel</Text>
        <TextInput
          style={styles.input}
          value={currentPin}
          onChangeText={setCurrentPin}
          secureTextEntry
          keyboardType="number-pad"
          placeholder="****"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Nouveau code PIN</Text>
        <TextInput
          style={styles.input}
          value={newPin}
          onChangeText={setNewPin}
          secureTextEntry
          keyboardType="number-pad"
          placeholder="****"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Confirmer le nouveau PIN</Text>
        <TextInput
          style={styles.input}
          value={confirmPin}
          onChangeText={setConfirmPin}
          secureTextEntry
          keyboardType="number-pad"
          placeholder="****"
          placeholderTextColor={Colors.textLight}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleChangePin}>
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 6,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
