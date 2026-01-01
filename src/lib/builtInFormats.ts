import { PrayerPhase, prayerPhases } from './prayerData';
import { PrayerFormat } from '@/hooks/usePrayerFormats';

// ACTS Prayer phases
const actsPhases: PrayerPhase[] = [
  {
    id: 'adoration',
    name: 'Adoration',
    description: 'Praise God for who He is',
    prompts: [
      'What attributes of God do you want to praise today?',
      'How has God revealed His character to you recently?',
      'What names of God resonate with you right now?',
      'Reflect on God\'s majesty and holiness.',
    ],
    scripture: {
      verse: 'Great is the LORD and most worthy of praise; his greatness no one can fathom.',
      reference: 'Psalm 145:3',
    },
  },
  {
    id: 'confession',
    name: 'Confession',
    description: 'Acknowledge sins and shortcomings',
    prompts: [
      'What sins do you need to confess today?',
      'Where have you fallen short of God\'s standard?',
      'What attitudes or thoughts need to be surrendered?',
      'Ask the Holy Spirit to reveal any hidden sin.',
    ],
    scripture: {
      verse: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.',
      reference: '1 John 1:9',
    },
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    description: 'Express gratitude for God\'s blessings',
    prompts: [
      'What blessings are you thankful for today?',
      'How has God provided for you recently?',
      'What answered prayers can you celebrate?',
      'What everyday gifts do you often overlook?',
    ],
    scripture: {
      verse: 'Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.',
      reference: '1 Thessalonians 5:18',
    },
  },
  {
    id: 'supplication',
    name: 'Supplication',
    description: 'Present your requests to God',
    prompts: [
      'What needs are pressing on your heart?',
      'Who needs your prayers today?',
      'What situations need God\'s intervention?',
      'What desires do you want to bring before God?',
    ],
    scripture: {
      verse: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
      reference: 'Philippians 4:6',
    },
  },
];

// Daily Examen phases
const examenPhases: PrayerPhase[] = [
  {
    id: 'presence',
    name: 'Presence',
    description: 'Become aware of God\'s presence',
    prompts: [
      'Take a moment to quiet your mind.',
      'Recognize that God is with you right now.',
      'Ask the Holy Spirit to guide your reflection.',
      'Rest in the knowledge that you are loved.',
    ],
    scripture: {
      verse: 'Where can I go from your Spirit? Where can I flee from your presence?',
      reference: 'Psalm 139:7',
    },
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    description: 'Review the day with thankfulness',
    prompts: [
      'What moments brought you joy today?',
      'Where did you see God\'s hand at work?',
      'What gifts did you receive today?',
      'Who blessed you with their presence?',
    ],
    scripture: {
      verse: 'This is the day the LORD has made; let us rejoice and be glad in it.',
      reference: 'Psalm 118:24',
    },
  },
  {
    id: 'emotions',
    name: 'Emotions',
    description: 'Reflect on your feelings throughout the day',
    prompts: [
      'What emotions did you experience today?',
      'When did you feel most alive?',
      'When did you feel drained or distant?',
      'What triggered strong feelings?',
    ],
    scripture: {
      verse: 'Search me, God, and know my heart; test me and know my anxious thoughts.',
      reference: 'Psalm 139:23',
    },
  },
  {
    id: 'reflection',
    name: 'Reflection',
    description: 'Examine your actions and choices',
    prompts: [
      'Where did you respond well today?',
      'Where did you fall short?',
      'What could you have done differently?',
      'What patterns do you notice in your behavior?',
    ],
    scripture: {
      verse: 'Let us examine our ways and test them, and let us return to the LORD.',
      reference: 'Lamentations 3:40',
    },
  },
  {
    id: 'hope',
    name: 'Hope',
    description: 'Look forward to tomorrow with trust',
    prompts: [
      'What do you anticipate about tomorrow?',
      'What do you need from God for the day ahead?',
      'How can you be more present to God tomorrow?',
      'What intention do you want to set?',
    ],
    scripture: {
      verse: 'Because of the LORD\'s great love we are not consumed, for his compassions never fail. They are new every morning.',
      reference: 'Lamentations 3:22-23',
    },
  },
];

// Built-in formats available to all users
export const builtInFormats: PrayerFormat[] = [
  {
    id: 'built-in-lords-prayer',
    name: "Lord's Prayer",
    description: 'The traditional prayer structure based on the Lord\'s Prayer',
    phases: prayerPhases,
    isDefault: true,
    isSystem: true,
    userId: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'built-in-acts',
    name: 'ACTS Prayer',
    description: 'Classic four-phase framework taught widely across denominations. Simple and memorable.',
    phases: actsPhases,
    isDefault: false,
    isSystem: true,
    userId: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'built-in-examen',
    name: 'Daily Examen',
    description: 'Reflective prayer practice from St. Ignatius of Loyola. Ideal for end-of-day prayer and spiritual awareness.',
    phases: examenPhases,
    isDefault: false,
    isSystem: true,
    userId: null,
    createdAt: '',
    updatedAt: '',
  },
];

// Helper to check if a format is built-in
export const isBuiltInFormat = (formatId: string): boolean => {
  return formatId.startsWith('built-in-');
};
