import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, TripPlace } from '../types';

const TRIPS_KEY = 'algeriago_trips';

export async function getTrips(): Promise<Trip[]> {
  const data = await AsyncStorage.getItem(TRIPS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveTrip(trip: Trip): Promise<void> {
  const trips = await getTrips();
  const index = trips.findIndex(t => t.id === trip.id);
  if (index >= 0) {
    trips[index] = trip;
  } else {
    trips.push(trip);
  }
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export async function deleteTrip(tripId: string): Promise<void> {
  const trips = await getTrips();
  const filtered = trips.filter(t => t.id !== tripId);
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(filtered));
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  const trips = await getTrips();
  return trips.find(t => t.id === tripId) || null;
}

export async function addPlaceToTrip(tripId: string, place: TripPlace): Promise<Trip | null> {
  const trips = await getTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) return null;

  const exists = trip.places.find(p => p.placeId === place.placeId);
  if (!exists) {
    place.order = trip.places.length;
    trip.places.push(place);
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  }
  return trip;
}

export async function removePlaceFromTrip(tripId: string, placeId: string): Promise<Trip | null> {
  const trips = await getTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) return null;

  trip.places = trip.places.filter(p => p.placeId !== placeId);
  trip.places.forEach((p, i) => { p.order = i; });
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  return trip;
}

export async function togglePlaceVisited(tripId: string, placeId: string): Promise<Trip | null> {
  const trips = await getTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) return null;

  const place = trip.places.find(p => p.placeId === placeId);
  if (place) {
    place.visited = !place.visited;
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  }
  return trip;
}

export async function reorderTripPlaces(tripId: string, places: TripPlace[]): Promise<void> {
  const trips = await getTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) return;

  trip.places = places.map((p, i) => ({ ...p, order: i }));
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function generateTripId(): string {
  return 'trip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}
