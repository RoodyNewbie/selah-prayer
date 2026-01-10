// Stones of Remembrance - renamed from Answered Prayers (Joshua 4:7)
// A sacred record of testimonies remembering God's faithfulness

export interface PrayerPhase {
  id: string;
  name: string;
  description: string;
  prompts: string[];
  scripture?: { verse: string; reference: string };
}

export const prayerPhases: PrayerPhase[] = [
  {
    id: 'praise',
    name: 'Praise',
    description: 'Begin with gratitude and worship',
    prompts: [
      'What are you grateful for today?',
      'How has God shown His faithfulness recently?',
      'What attribute of God do you want to celebrate?',
      'Reflect on a blessing you may have overlooked.',
      'What fills your heart with wonder about God?',
    ],
    scripture: {
      verse: 'Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name.',
      reference: 'Psalm 100:4',
    },
  },
  {
    id: 'will',
    name: "God's Will",
    description: 'Surrender and seek alignment',
    prompts: [
      'Where do you need to surrender control?',
      'What decisions need God\'s guidance?',
      'How can you align your desires with His purposes?',
      'What part of your life needs His direction?',
      'Ask God to reveal His path for you today.',
    ],
    scripture: {
      verse: 'Your kingdom come, your will be done, on earth as it is in heaven.',
      reference: 'Matthew 6:10',
    },
  },
  {
    id: 'needs',
    name: 'Practical Needs',
    description: 'Bring your specific requests',
    prompts: [
      'What pressing needs are on your heart?',
      'Who in your life needs prayer right now?',
      'What situation feels impossible without God?',
      'Where do you need provision or breakthrough?',
      'What burdens are you carrying that God wants to share?',
    ],
    scripture: {
      verse: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
      reference: 'Philippians 4:6',
    },
  },
  {
    id: 'forgiveness',
    name: 'Forgiveness',
    description: 'Confession and releasing others',
    prompts: [
      'Is there anything you need to confess?',
      'Who do you need to forgive today?',
      'Where have you fallen short this week?',
      'What resentment are you holding onto?',
      'Ask God to search your heart.',
    ],
    scripture: {
      verse: 'Forgive us our debts, as we also have forgiven our debtors.',
      reference: 'Matthew 6:12',
    },
  },
  {
    id: 'protection',
    name: 'Protection',
    description: 'Spiritual covering and strength',
    prompts: [
      'Where do you feel spiritually vulnerable?',
      'What temptations are you facing?',
      'Who needs God\'s protection today?',
      'What fears do you need to release to God?',
      'Ask for strength in your weakest areas.',
    ],
    scripture: {
      verse: 'And lead us not into temptation, but deliver us from the evil one.',
      reference: 'Matthew 6:13',
    },
  },
  {
    id: 'worship',
    name: 'Worship',
    description: 'Close with adoration',
    prompts: [
      'What aspect of God\'s character moves you?',
      'How would you describe God\'s love for you?',
      'What do you want to say to God as you close?',
      'Rest in His presence for a moment.',
      'Declare who God is to you today.',
    ],
    scripture: {
      verse: 'For yours is the kingdom and the power and the glory forever. Amen.',
      reference: 'Matthew 6:13b',
    },
  },
];

export type RequestTag = 'family' | 'work' | 'health' | 'finances' | 'spiritual' | 'others';

export type AnswerType = 'fully' | 'differently' | 'partially' | 'peace';

export const requestTags: { id: RequestTag; label: string; color: string }[] = [
  { id: 'family', label: 'Family', color: 'bg-phase-praise' },
  { id: 'work', label: 'Work', color: 'bg-phase-will' },
  { id: 'health', label: 'Health', color: 'bg-phase-needs' },
  { id: 'finances', label: 'Finances', color: 'bg-phase-forgive' },
  { id: 'spiritual', label: 'Spiritual', color: 'bg-phase-protect' },
  { id: 'others', label: 'Others', color: 'bg-phase-worship' },
];

export const answerTypeLabels: Record<AnswerType, string> = {
  fully: 'Fully Answered',
  differently: 'Answered Differently',
  partially: 'Partially Answered',
  peace: 'Peace Received',
};

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  tag: RequestTag;
  isRecurring: boolean;
  isAnswered: boolean;
  answeredNote?: string;
  answeredDate?: string;
  testimony?: string;
  answerType?: AnswerType;
  gratitudeNote?: string;
  isFavorite?: boolean;
  createdAt: string;
}

export interface PrayerSession {
  id: string;
  timestamp: string;
  phases: {
    [key: string]: string;
  };
  generatedPrayer?: string;
}

// Journal entries types
export type JournalEntryType = 'dream' | 'word';
export type JournalStatus = 'active' | 'fulfilled';

export interface JournalEntry {
  id: string;
  title: string;
  description: string;
  entryType: JournalEntryType;
  status: JournalStatus;
  scriptureReference?: string;
  fulfilledDate?: string;
  fulfilledNote?: string;
  createdAt: string;
}

export const journalTypeLabels: Record<JournalEntryType, string> = {
  dream: 'Dream',
  word: 'Word from God',
};
