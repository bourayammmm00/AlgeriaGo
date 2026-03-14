import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import StarRating from './StarRating';
import { Review } from '../types';
import { getReviews, addReview, getUserName, setUserName } from '../stores/reviewStore';

interface ReviewSectionProps {
  placeId: string;
}

export default function ReviewSection({ placeId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserNameState] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
    loadUserName();
  }, [placeId]);

  const loadReviews = async () => {
    setLoading(true);
    const data = await getReviews(placeId);
    setReviews(data);
    setLoading(false);
  };

  const loadUserName = async () => {
    const name = await getUserName();
    setUserNameState(name);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note.');
      return;
    }
    if (comment.trim().length === 0) {
      Alert.alert('Erreur', 'Veuillez écrire un commentaire.');
      return;
    }

    if (userName !== 'Visiteur') {
      await setUserName(userName);
    }

    await addReview({
      placeId,
      userName: userName || 'Visiteur',
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
      helpful: 0,
    });

    setRating(0);
    setComment('');
    setShowForm(false);
    loadReviews();
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.userName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewName}>{item.userName}</Text>
          <Text style={styles.reviewDate}>
            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <StarRating rating={item.rating} size={14} />
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Avis ({reviews.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'create-outline'} size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>{showForm ? 'Annuler' : 'Écrire un avis'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.nameInput}
            placeholder="Votre nom"
            value={userName}
            onChangeText={setUserNameState}
            placeholderTextColor={Colors.textLight}
          />
          <Text style={styles.formLabel}>Votre note :</Text>
          <StarRating rating={rating} size={32} editable onRatingChange={setRating} />
          <TextInput
            style={styles.commentInput}
            placeholder="Partagez votre expérience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            placeholderTextColor={Colors.textLight}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Publier l'avis</Text>
          </TouchableOpacity>
        </View>
      )}

      {reviews.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-outline" size={40} color={Colors.textLight} />
          <Text style={styles.emptyText}>Aucun avis pour le moment</Text>
          <Text style={styles.emptySubtext}>Soyez le premier à donner votre avis !</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  form: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: Colors.text,
    marginTop: 12,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  reviewMeta: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
});
