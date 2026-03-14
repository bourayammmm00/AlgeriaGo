import AsyncStorage from '@react-native-async-storage/async-storage';
import { Review } from '../types';

// Reviews are stored locally by default.
// To enable Firebase sync, uncomment the Firebase imports below
// and replace the local functions with Firestore calls.

// import { db } from '../firebase/config';
// import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

const REVIEWS_KEY = 'algeriago_reviews';
const USERNAME_KEY = 'algeriago_username';

export async function getReviews(placeId: string): Promise<Review[]> {
  // Firebase version (uncomment when configured):
  // const q = query(collection(db, 'reviews'), where('placeId', '==', placeId), orderBy('date', 'desc'));
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));

  const data = await AsyncStorage.getItem(REVIEWS_KEY);
  const all: Review[] = data ? JSON.parse(data) : [];
  return all.filter(r => r.placeId === placeId).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function addReview(review: Omit<Review, 'id'>): Promise<Review> {
  // Firebase version (uncomment when configured):
  // const docRef = await addDoc(collection(db, 'reviews'), review);
  // return { id: docRef.id, ...review };

  const data = await AsyncStorage.getItem(REVIEWS_KEY);
  const all: Review[] = data ? JSON.parse(data) : [];
  const newReview: Review = {
    ...review,
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
  };
  all.push(newReview);
  await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  return newReview;
}

export async function getUserName(): Promise<string> {
  const name = await AsyncStorage.getItem(USERNAME_KEY);
  return name || 'Visiteur';
}

export async function setUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(USERNAME_KEY, name);
}

export async function getAverageRating(placeId: string): Promise<{ average: number; count: number }> {
  const reviews = await getReviews(placeId);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
