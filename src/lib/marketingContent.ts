import { BookOpen, ClipboardList, Compass, Cross, Flame, Heart, LayoutGrid } from 'lucide-react';
import { builtInFormats } from '@/lib/builtInFormats';

const frameworkIcons = [Cross, LayoutGrid, Flame] as const;

export const landingFrameworks = builtInFormats.map((format, index) => ({
  id: format.id,
  title: format.name,
  description: format.description,
  phases: format.phases.length,
  icon: frameworkIcons[index] ?? LayoutGrid,
}));

export const landingFeatures = [
  {
    title: 'Guided Prayer Flow',
    description: "Step through each phase with prompts that help you articulate what's on your heart.",
    icon: Compass,
    route: '/pray',
  },
  {
    title: 'Prayer Requests',
    description: "Capture what's weighing on you and revisit it in your prayers.",
    icon: ClipboardList,
    route: '/requests',
  },
  {
    title: 'Stones of Remembrance',
    description: "Mark answered prayers and build a record of God's faithfulness.",
    icon: Heart,
    route: '/answered',
  },
  {
    title: 'Scripture-Led Encouragement',
    description: 'Return to a quiet home screen anchored by Scripture before you begin prayer.',
    icon: BookOpen,
    route: '/home',
  },
] as const;

// Static demo content uses app domain language and route labels, but does not represent user data.
export const demoAnsweredPrayers = [
  {
    title: 'Healing for a friend',
    testimony: 'A quiet reminder that God was present through every appointment.',
    answerType: 'fully',
  },
];

// Static demo content mirrors the PrayerSession domain shape for landing copy only.
export const demoHistorySessions = [
  {
    id: 'demo-session-1',
    phases: {
      praise: 'Remembered God’s faithfulness this morning.',
      needs: 'Prayed for wisdom and provision.',
    },
    generatedPrayer: 'Lord, keep my heart steady and attentive today.',
  },
];
