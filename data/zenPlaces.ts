export interface ZenPlace {
  id: string;
  name: string;
  description: string;
  type: 'park' | 'meditation' | 'cafe' | 'garden';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
}

export const zenPlaces: ZenPlace[] = [
  {
    id: '1',
    name: 'Vondelpark Meditation Garden',
    description: 'A peaceful corner in Amsterdam\'s famous park, perfect for meditation and reflection.',
    type: 'park',
    coordinates: {
      latitude: 52.3579,
      longitude: 4.8686,
    },
    imageUrl: 'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Zen Garden Cafe',
    description: 'A tranquil cafe with Japanese-inspired decor and a peaceful atmosphere.',
    type: 'cafe',
    coordinates: {
      latitude: 52.3673,
      longitude: 4.9041,
    },
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Hortus Botanicus',
    description: 'One of the oldest botanical gardens with peaceful walking paths and meditation spots.',
    type: 'garden',
    coordinates: {
      latitude: 52.3667,
      longitude: 4.9089,
    },
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    name: 'Buddhist Center Amsterdam',
    description: 'A peaceful meditation center offering guided sessions and quiet spaces.',
    type: 'meditation',
    coordinates: {
      latitude: 52.3726,
      longitude: 4.8926,
    },
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80',
  },
]; 