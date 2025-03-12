import { ZenPlace } from '../data/zenPlaces';
import { UserPreferences } from '../types/preferences';

interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    leisure?: string;
    tourism?: string;
    natural?: string;
    historic?: string;
    [key: string]: string | undefined;
  };
}

interface OSMResponse {
  elements: OSMNode[];
}

// Default location (Amsterdam)
const DEFAULT_LAT = 52.3676;
const DEFAULT_LON = 4.9041;
const DEFAULT_RADIUS = 2000; // 2km radius to limit memory usage

console.log("PREFERENCE-AWARE MEMORY-OPTIMIZED VERSION LOADED");

// Use a much simpler hardcoded query with strict limits
const HARDCODED_QUERY = '[out:json][timeout:5];(node[leisure="park"](around:2000,52.3676,4.9041);node[amenity="cafe"](around:2000,52.3676,4.9041););out body 10;';

// Mock data generator for development - ensures we always have recommendations
function generateMockPlaces(preferences: UserPreferences): ZenPlace[] {
  console.log("Generating mock places with user preferences:", JSON.stringify(preferences));
  
  // Types we'll generate based on preferences - respect user's choices more strictly
  const types: Array<'park' | 'meditation' | 'cafe' | 'garden'> = [];
  
  // Only add types that match the user's strong preferences
  if (preferences.parks || preferences.nature > 7) types.push('park');
  if (preferences.gardens || preferences.nature > 7) types.push('garden');
  if (preferences.cafes || preferences.indoor > 7) types.push('cafe');
  
  // Only add meditation if it's a strong preference
  if ((preferences.meditation > 6) && (preferences.quiet > 6)) {
    types.push('meditation');
  }
  
  console.log("Selected types based on preferences:", types);
  
  // Ensure we have at least one type
  if (types.length === 0) {
    // Default to parks and cafes as safe options
    types.push('park');
    
    // Add cafe only if social preference is moderate or higher
    if (preferences.social > 4) {
      types.push('cafe');
    }
    
    console.log("No strong preferences found, defaulting to:", types);
  }
  
  // Generate mock data for Amsterdam
  const baseLat = DEFAULT_LAT;
  const baseLon = DEFAULT_LON;
  
  // Names based on types
  const typeNames = {
    park: ['Tranquil Park', 'Nature Reserve', 'Green Oasis', 'Urban Garden'],
    garden: ['Botanical Gardens', 'Flower Garden', 'Zen Garden', 'Japanese Garden'],
    cafe: ['Peaceful Cafe', 'Quiet Coffee House', 'Zen Coffee', 'Mindful Brew'],
    meditation: ['Meditation Center', 'Mindfulness Studio', 'Zen Temple', 'Yoga Studio']
  };
  
  // Descriptions based on types
  const typeDescriptions = {
    park: [
      'A peaceful park with plenty of quiet spots for reflection.',
      'A green space with beautiful trees and walking paths.',
      'An urban oasis with areas for relaxation and meditation.'
    ],
    garden: [
      'A beautiful garden with exotic plants and quiet corners.',
      'A meticulously maintained garden perfect for contemplation.',
      'A zen-inspired garden with peaceful water features.'
    ],
    cafe: [
      'A cozy cafe where you can enjoy a quiet moment with your thoughts.',
      'A tranquil coffee shop with comfortable seating and relaxing atmosphere.',
      'A mindful space to enjoy quality beverages and peace.'
    ],
    meditation: [
      'A dedicated space for meditation practices and mindfulness.',
      'A serene center offering guided meditation and quiet reflection.',
      'A spiritual space designed for inner peace and contemplation.'
    ]
  };
  
  // Image URLs based on types
  const typeImages = {
    park: 'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&q=80',
    garden: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80',
    meditation: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80'
  };
  
  // Generate places
  const places: ZenPlace[] = [];
  
  // Generate 5-10 places of matching types
  const count = Math.floor(Math.random() * 6) + 5;
  
  for (let i = 0; i < count; i++) {
    // Weight types based on user preferences to ensure better matches
    let weightedTypes = [...types];
    
    // Add more instances of park if nature preference is high
    if (preferences.nature > 7 && types.includes('park')) {
      weightedTypes.push('park', 'park');
    }
    
    // Add more instances of cafe if social preference is high
    if (preferences.social > 7 && types.includes('cafe')) {
      weightedTypes.push('cafe', 'cafe');
    }
    
    // Add more instances of garden if gardening preference is high
    if (preferences.gardens && types.includes('garden')) {
      weightedTypes.push('garden', 'garden');
    }
    
    // Pick a random type from the weighted types
    const type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    
    // Generate a random location within 5km of the base coordinates
    const latVariance = (Math.random() - 0.5) * 0.05;
    const lonVariance = (Math.random() - 0.5) * 0.05;
    
    // Choose a random name and description for the type
    const nameOptions = typeNames[type];
    const descOptions = typeDescriptions[type];
    const name = nameOptions[Math.floor(Math.random() * nameOptions.length)];
    const description = descOptions[Math.floor(Math.random() * descOptions.length)];
    
    // Generate a unique name by adding a location qualifier
    const directions = ['North', 'South', 'East', 'West', 'Central', 'Old Town'];
    const qualifier = directions[Math.floor(Math.random() * directions.length)];
    const uniqueName = `${name} ${qualifier}`;
    
    places.push({
      id: `mock-${type}-${i}`,
      name: uniqueName,
      description,
      type,
      coordinates: {
        latitude: baseLat + latVariance,
        longitude: baseLon + lonVariance,
      },
      imageUrl: typeImages[type],
    });
  }
  
  console.log(`Generated ${places.length} mock places with types: ${places.map(p => p.type).join(', ')}`);
  return places;
}

/**
 * Construct the OpenStreetMap Overpass API query based on user preferences
 */
function buildOverpassQuery(
  preferences: UserPreferences,
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON,
  radius: number = DEFAULT_RADIUS
): string {
  console.log("Building Overpass query with preferences:", JSON.stringify(preferences));
  
  // Start with all potential zen places
  let amenities: string[] = [];
  let leisures: string[] = [];
  let tourisms: string[] = [];
  let naturals: string[] = [];
  let historics: string[] = [];
  
  // Add specific types based on boolean preferences
  if (preferences.parks) {
    leisures.push('park');
  }
  
  if (preferences.gardens) {
    leisures.push('garden');
    leisures.push('nature_reserve');
  }
  
  if (preferences.cafes) {
    amenities.push('cafe');
  }
  
  if (preferences.libraries) {
    amenities.push('library');
  }
  
  if (preferences.museums) {
    tourisms.push('museum');
  }
  
  if (preferences.wellness) {
    amenities.push('spa');
    leisures.push('wellness');
  }
  
  // Only add yoga/meditation places if meditation preference is high
  if (preferences.meditation > 5) {
    amenities.push('yoga');
  }
  
  if (preferences.viewpoints) {
    tourisms.push('viewpoint');
  }
  
  if (preferences.waterfront) {
    naturals.push('water');
    naturals.push('beach');
  }
  
  // Only add temples if meditation preference is high
  if (preferences.temples && preferences.meditation > 5) {
    amenities.push('place_of_worship');
  }
  
  if (preferences.historic) {
    historics.push('monument');
    historics.push('castle');
    historics.push('ruins');
  }
  
  // If nothing selected, add some defaults based on numerical preferences
  if (
    amenities.length === 0 &&
    leisures.length === 0 &&
    tourisms.length === 0 &&
    naturals.length === 0 &&
    historics.length === 0
  ) {
    // Nature preference
    if (preferences.nature > 5) {
      leisures.push('park');
      leisures.push('garden');
      naturals.push('water');
    }
    
    // Quiet preference
    if (preferences.quiet > 5) {
      leisures.push('park');
      amenities.push('library');
    }
    
    // Meditation preference - only add if it's actually high
    if (preferences.meditation > 6) {
      amenities.push('place_of_worship');
      amenities.push('yoga');
    }
    
    // Water preference
    if (preferences.water > 5) {
      naturals.push('water');
    }
    
    // Urban preference
    if (preferences.urban > 5) {
      amenities.push('cafe');
      tourisms.push('museum');
    }
  }
  
  // Ensure we have at least some queries
  if (
    amenities.length === 0 &&
    leisures.length === 0 &&
    tourisms.length === 0 &&
    naturals.length === 0 &&
    historics.length === 0
  ) {
    leisures.push('park');
    amenities.push('cafe');
  }
  
  // Build the Overpass query - use a simpler query format that's more reliable
  // This query format is more likely to work with various CORS proxies
  let query = '[out:json];';
  
  // Add node queries for each category
  if (amenities.length > 0) {
    amenities.forEach(amenity => {
      query += `node[amenity="${amenity}"](around:${radius},${lat},${lon});`;
    });
  }
  
  if (leisures.length > 0) {
    leisures.forEach(leisure => {
      query += `node[leisure="${leisure}"](around:${radius},${lat},${lon});`;
    });
  }
  
  if (tourisms.length > 0) {
    tourisms.forEach(tourism => {
      query += `node[tourism="${tourism}"](around:${radius},${lat},${lon});`;
    });
  }
  
  if (naturals.length > 0) {
    naturals.forEach(natural => {
      query += `node[natural="${natural}"](around:${radius},${lat},${lon});`;
    });
  }
  
  if (historics.length > 0) {
    historics.forEach(historic => {
      query += `node[historic="${historic}"](around:${radius},${lat},${lon});`;
    });
  }
  
  // Add output format
  query += 'out body;';
  
  console.log("Generated Overpass query:", query);
  return query;
}

/**
 * Fetch places from OpenStreetMap based on user preferences
 */
export async function fetchZenPlaces(
  preferences: UserPreferences,
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON
): Promise<ZenPlace[]> {
  try {
    console.log("FETCHING PREFERENCE-BASED PLACES FROM AMSTERDAM");
    
    // Build a query based on the user's actual preferences but keep it memory-efficient
    let preferenceQuery = '[out:json][timeout:5];(';
    
    // Always include parks if nature preference is high
    if (preferences.parks || preferences.nature > 5) {
      preferenceQuery += `node[leisure="park"](around:${DEFAULT_RADIUS},${lat},${lon});`;
    }
    
    // Include cafes if social or indoor preference is high
    if (preferences.cafes || preferences.social > 5 || preferences.indoor > 5) {
      preferenceQuery += `node[amenity="cafe"](around:${DEFAULT_RADIUS},${lat},${lon});`;
    }
    
    // Include gardens if garden preference is selected
    if (preferences.gardens || preferences.nature > 7) {
      preferenceQuery += `node[leisure="garden"](around:${DEFAULT_RADIUS},${lat},${lon});`;
    }
    
    // Include meditation places if meditation preference is high
    if (preferences.meditation > 5) {
      preferenceQuery += `node[amenity="place_of_worship"](around:${DEFAULT_RADIUS},${lat},${lon});`;
      preferenceQuery += `node[amenity="yoga"](around:${DEFAULT_RADIUS},${lat},${lon});`;
    }
    
    // Ensure we have at least some basic query elements if nothing was selected
    if (preferenceQuery === '[out:json][timeout:5];(') {
      preferenceQuery += `node[leisure="park"](around:${DEFAULT_RADIUS},${lat},${lon});`;
      preferenceQuery += `node[amenity="cafe"](around:${DEFAULT_RADIUS},${lat},${lon});`;
    }
    
    // Close the query with a limit to ensure memory efficiency
    preferenceQuery += ');out body 20;'; // Limit to 20 places maximum
    
    console.log("Using preference-based query:", preferenceQuery);
    
    try {
      const directResponse = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(preferenceQuery)}`,
      });
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        console.log(`Received ${data.elements ? data.elements.length : 0} places from Amsterdam`);
        
        if (data.elements && data.elements.length > 0) {
          // Convert OSM nodes to ZenPlace format - limit to max 20 places
          const limitedElements = data.elements.slice(0, 20);
          
          const places: ZenPlace[] = limitedElements.map((node: any, index: number) => {
            // Determine the type of place
            let type: 'park' | 'meditation' | 'cafe' | 'garden' = 'park';
            
            if (node.tags) {
              if (node.tags.amenity === 'cafe') {
                type = 'cafe';
              } else if (node.tags.leisure === 'garden') {
                type = 'garden';
              } else if (node.tags.amenity === 'place_of_worship' || node.tags.amenity === 'yoga') {
                type = 'meditation';
              }
            }
            
            // Create the ZenPlace object with minimal processing
            return {
              id: `osm-${node.id}`,
              name: (node.tags && node.tags.name) ? node.tags.name : `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
              description: `A nice ${type} in Amsterdam.`,
              type,
              coordinates: {
                latitude: node.lat,
                longitude: node.lon,
              },
              imageUrl: getImageForType(type),
            };
          });
          
          console.log('Successfully retrieved real places:', places.map(p => `${p.name} (${p.type})`).join(', '));
          return places;
        }
      } else {
        console.error("API response not OK:", directResponse.status, directResponse.statusText);
      }
    } catch (directError) {
      console.error("Direct API call failed:", directError);
    }
    
    // If we get here, the API call failed - use mock data
    console.log('API call failed, using mock data');
    return generateMockPlaces(preferences);
  } catch (error) {
    console.error('Error fetching zen places:', error);
    // Generate mock data as a fallback
    console.log('Using mock data as fallback due to API error');
    return generateMockPlaces(preferences);
  }
}

// Helper function to get image URL based on place type
function getImageForType(type: 'park' | 'meditation' | 'cafe' | 'garden'): string {
  switch (type) {
    case 'cafe':
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80';
    case 'garden':
      return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80';
    case 'meditation':
      return 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80';
    case 'park':
    default:
      return 'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&q=80';
  }
}

/**
 * Score a place based on user preferences
 */
export function scorePlace(place: ZenPlace, preferences: UserPreferences): number {
  let score = 50; // Start with a base score
  
  // Type-based scoring - now more strongly weighted by preferences
  switch (place.type) {
    case 'park':
      score += preferences.parks ? 20 : 0;
      score += preferences.nature * 2.5;
      score += preferences.outdoor * 2;
      score += (10 - preferences.urban) * 1.5;
      // Penalize parks if nature preference is low
      if (preferences.nature < 4) score -= 20;
      break;
    case 'garden':
      score += preferences.gardens ? 25 : 0;
      score += preferences.nature * 2;
      score += preferences.meditation * 1;
      // Penalize gardens if garden preference is false
      if (!preferences.gardens) score -= 15;
      break;
    case 'cafe':
      score += preferences.cafes ? 25 : 0;
      score += preferences.indoor * 1.5;
      score += preferences.social * 2;
      // Penalize cafes if social preference is low
      if (preferences.social < 4) score -= 15;
      if (!preferences.cafes) score -= 15;
      break;
    case 'meditation':
      // More strongly influenced by meditation preference
      score += preferences.meditation * 4;
      score += preferences.quiet * 2;
      score += preferences.solitude * 1.5;
      // Heavily penalize meditation centers if meditation preference is low
      if (preferences.meditation < 5) score -= 40;
      break;
  }
  
  // Adjustment based on other factors
  if (place.name.toLowerCase().includes('garden')) {
    score += preferences.gardens ? 10 : 0;
  }
  
  if (place.name.toLowerCase().includes('water') || 
      place.description.toLowerCase().includes('water')) {
    score += preferences.water * 2;
  }
  
  if (place.name.toLowerCase().includes('view') || 
      place.description.toLowerCase().includes('view')) {
    score += preferences.viewpoints ? 10 : 0;
  }
  
  // Normalize score between 0 and 100
  return Math.min(100, Math.max(0, score));
}

/**
 * Get recommended places based on user preferences
 */
export async function getRecommendedPlaces(
  preferences: UserPreferences,
  fallbackPlaces: ZenPlace[] = [],
  limit: number = 10
): Promise<ZenPlace[]> {
  // Try to fetch places from OpenStreetMap
  let places = await fetchZenPlaces(preferences);
  
  // If no places are found, use fallback data
  if (places.length === 0 && fallbackPlaces.length > 0) {
    console.log('No places returned from API, using fallback data');
    places = fallbackPlaces;
  }
  
  // Score and sort the places
  const scoredPlaces = places.map(place => {
    const score = scorePlace(place, preferences);
    console.log(`Scored ${place.name} (${place.type}): ${score}`);
    return {
      place,
      score
    };
  });
  
  scoredPlaces.sort((a, b) => b.score - a.score);
  
  // Return the top recommendations
  return scoredPlaces.slice(0, limit).map(item => item.place);
} 