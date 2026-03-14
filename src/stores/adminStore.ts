import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place } from '../types';

const CUSTOM_PLACES_KEY = 'algeriago_custom_places';
const ADMIN_PIN_KEY = 'algeriago_admin_pin';
const DEFAULT_PIN = '1234';

export async function getAdminPin(): Promise<string> {
  const pin = await AsyncStorage.getItem(ADMIN_PIN_KEY);
  return pin || DEFAULT_PIN;
}

export async function setAdminPin(pin: string): Promise<void> {
  await AsyncStorage.setItem(ADMIN_PIN_KEY, pin);
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const stored = await getAdminPin();
  return pin === stored;
}

export async function getCustomPlaces(): Promise<Place[]> {
  const data = await AsyncStorage.getItem(CUSTOM_PLACES_KEY);
  return data ? JSON.parse(data) : [];
}

export async function addCustomPlace(place: Place): Promise<void> {
  const places = await getCustomPlaces();
  places.push(place);
  await AsyncStorage.setItem(CUSTOM_PLACES_KEY, JSON.stringify(places));
}

export async function updateCustomPlace(place: Place): Promise<void> {
  const places = await getCustomPlaces();
  const index = places.findIndex(p => p.id === place.id);
  if (index >= 0) {
    places[index] = place;
    await AsyncStorage.setItem(CUSTOM_PLACES_KEY, JSON.stringify(places));
  }
}

export async function deleteCustomPlace(placeId: string): Promise<void> {
  const places = await getCustomPlaces();
  const filtered = places.filter(p => p.id !== placeId);
  await AsyncStorage.setItem(CUSTOM_PLACES_KEY, JSON.stringify(filtered));
}

export function generatePlaceId(): string {
  return 'custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}
