// Define the types of preferences a user can have
export interface UserPreferences {
  // Numerical preferences (scale of 1-10)
  nature: number;       // Preference for natural environments
  quiet: number;        // Preference for quiet places
  indoor: number;       // Preference for indoor locations
  outdoor: number;      // Preference for outdoor locations
  social: number;       // Preference for social environments
  solitude: number;     // Preference for being alone
  activity: number;     // Preference for active environments
  meditation: number;   // Preference for meditation-friendly places
  water: number;        // Preference for being near water
  urban: number;        // Preference for urban environments
  
  // Boolean preferences (true/false)
  parks: boolean;       // Interest in parks
  gardens: boolean;     // Interest in gardens
  cafes: boolean;       // Interest in cafes
  libraries: boolean;   // Interest in libraries
  museums: boolean;     // Interest in museums
  wellness: boolean;    // Interest in wellness centers
  viewpoints: boolean;  // Interest in scenic viewpoints
  waterfront: boolean;  // Interest in waterfront areas
  temples: boolean;     // Interest in temples/religious sites
  historic: boolean;    // Interest in historic places
}

// Default preferences (moderate interest in everything)
export const defaultPreferences: UserPreferences = {
  nature: 5,
  quiet: 5,
  indoor: 5,
  outdoor: 5,
  social: 5,
  solitude: 5,
  activity: 5,
  meditation: 5,
  water: 5,
  urban: 5,
  parks: false,
  gardens: false,
  cafes: false, 
  libraries: false,
  museums: false,
  wellness: false,
  viewpoints: false,
  waterfront: false,
  temples: false,
  historic: false
};

// Question structure for the questionnaire
export interface Question {
  id: string;
  text: string;
  description: string;
  type: 'slider' | 'choices' | 'multiselect';
  options?: string[];
  preferenceKey: keyof UserPreferences;
}

// Questions for the questionnaire
export const questions: Question[] = [
  {
    id: '1',
    text: 'How much do you enjoy nature?',
    description: 'This helps us recommend places with natural elements.',
    type: 'slider',
    preferenceKey: 'nature'
  },
  {
    id: '2',
    text: 'Do you prefer quiet places?',
    description: 'Rate from 1 (lively) to 10 (very quiet).',
    type: 'slider',
    preferenceKey: 'quiet'
  },
  {
    id: '3',
    text: 'Do you prefer indoor or outdoor spaces?',
    description: 'Rate from 1 (indoor) to 10 (outdoor).',
    type: 'slider',
    preferenceKey: 'outdoor'
  },
  {
    id: '4',
    text: 'How social do you want your zen place to be?',
    description: 'Rate from 1 (solitary) to 10 (social).',
    type: 'slider',
    preferenceKey: 'social'
  },
  {
    id: '5',
    text: 'How active do you want to be at your zen place?',
    description: 'Rate from 1 (completely relaxed) to 10 (physically active).',
    type: 'slider',
    preferenceKey: 'activity'
  },
  {
    id: '6',
    text: 'How important is meditation in your zen practice?',
    description: 'Rate from 1 (not important) to 10 (very important).',
    type: 'slider',
    preferenceKey: 'meditation'
  },
  {
    id: '7',
    text: 'How much do you enjoy being near water?',
    description: 'Rate from 1 (not important) to 10 (very important).',
    type: 'slider',
    preferenceKey: 'water'
  },
  {
    id: '8',
    text: 'How urban do you prefer your environment?',
    description: 'Rate from 1 (completely natural) to 10 (very urban).',
    type: 'slider',
    preferenceKey: 'urban'
  },
  {
    id: '9',
    text: 'What type of places help you feel zen?',
    description: 'Select all that apply to get personalized recommendations.',
    type: 'multiselect',
    options: ['Parks', 'Gardens', 'Cafes', 'Libraries', 'Museums', 'Wellness Centers', 'Viewpoints', 'Waterfront', 'Temples', 'Historic Sites'],
    preferenceKey: 'parks' // This is just a placeholder, multiselect will handle multiple keys
  },
  {
    id: '10',
    text: 'Which of these words best describes your ideal zen place?',
    description: 'Choose the option that resonates most with you.',
    type: 'choices',
    options: ['Peaceful Nature', 'Quiet Indoors', 'Active Outdoors', 'Social Setting', 'Meditative Space'],
    preferenceKey: 'nature' // This is just a placeholder, the choice will affect multiple preferences
  }
]; 