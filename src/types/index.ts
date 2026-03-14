export type PlaceCategory = 'attraction' | 'restaurant' | 'hotel' | 'plage' | 'musee' | 'mosque' | 'parc' | 'marche';

export interface Place {
  id: string;
  name: string;
  description: string;
  category: PlaceCategory;
  city: string;
  wilaya: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  address: string;
  phone?: string;
  openingHours?: string;
  priceRange?: string;
  tags: string[];
}

export interface Review {
  id: string;
  placeId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface TripPlace {
  placeId: string;
  name: string;
  order: number;
  estimatedDuration: number; // minutes
  visited: boolean;
}

export interface Trip {
  id: string;
  name: string;
  city: string;
  date: string;
  places: TripPlace[];
  createdAt: string;
}

export interface City {
  name: string;
  wilaya: string;
  latitude: number;
  longitude: number;
  image: string;
  description: string;
  placeCount: number;
}
