/**
 * Curated scripture prompts for each prayer phase.
 * Verses are ESV translations for consistency.
 */

export interface PhaseScripture {
  reference: string;      // e.g., "Psalm 100:4"
  text: string;           // The full verse text
  shortText?: string;     // Optional abbreviated version for mobile
}

export const phaseScriptures: Record<string, PhaseScripture[]> = {
  praise: [
    { reference: "Psalm 100:4", text: "Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name!" },
    { reference: "Psalm 34:1", text: "I will bless the Lord at all times; his praise shall continually be in my mouth." },
    { reference: "Psalm 150:6", text: "Let everything that has breath praise the Lord! Praise the Lord!" },
    { reference: "Hebrews 13:15", text: "Through him then let us continually offer up a sacrifice of praise to God, that is, the fruit of lips that acknowledge his name." },
    { reference: "Psalm 95:1-2", text: "Oh come, let us sing to the Lord; let us make a joyful noise to the rock of our salvation! Let us come into his presence with thanksgiving." },
  ],
  will: [
    { reference: "Matthew 6:10", text: "Your kingdom come, your will be done, on earth as it is in heaven." },
    { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
    { reference: "Romans 12:2", text: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God." },
    { reference: "James 4:15", text: "Instead you ought to say, 'If the Lord wills, we will live and do this or that.'" },
    { reference: "Psalm 40:8", text: "I delight to do your will, O my God; your law is within my heart." },
  ],
  needs: [
    { reference: "Philippians 4:6", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God." },
    { reference: "Matthew 7:7", text: "Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you." },
    { reference: "Matthew 6:11", text: "Give us this day our daily bread." },
    { reference: "James 1:5", text: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him." },
    { reference: "1 John 5:14", text: "And this is the confidence that we have toward him, that if we ask anything according to his will he hears us." },
  ],
  forgiveness: [
    { reference: "1 John 1:9", text: "If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness." },
    { reference: "Matthew 6:12", text: "And forgive us our debts, as we also have forgiven our debtors." },
    { reference: "Colossians 3:13", text: "Bearing with one another and, if one has a complaint against another, forgiving each other; as the Lord has forgiven you, so you also must forgive." },
    { reference: "Psalm 51:10", text: "Create in me a clean heart, O God, and renew a right spirit within me." },
    { reference: "Ephesians 4:32", text: "Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you." },
  ],
  protection: [
    { reference: "Psalm 91:1-2", text: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty. I will say to the Lord, 'My refuge and my fortress, my God, in whom I trust.'" },
    { reference: "2 Thessalonians 3:3", text: "But the Lord is faithful. He will establish you and guard you against the evil one." },
    { reference: "Psalm 121:7-8", text: "The Lord will keep you from all evil; he will keep your life. The Lord will keep your going out and your coming in from this time forth and forevermore." },
    { reference: "Matthew 6:13", text: "And lead us not into temptation, but deliver us from evil." },
    { reference: "Ephesians 6:11", text: "Put on the whole armor of God, that you may be able to stand against the schemes of the devil." },
  ],
  worship: [
    { reference: "Revelation 4:11", text: "Worthy are you, our Lord and God, to receive glory and honor and power, for you created all things, and by your will they existed and were created." },
    { reference: "Psalm 29:2", text: "Ascribe to the Lord the glory due his name; worship the Lord in the splendor of holiness." },
    { reference: "John 4:24", text: "God is spirit, and those who worship him must worship in spirit and truth." },
    { reference: "Psalm 63:3-4", text: "Because your steadfast love is better than life, my lips will praise you. So I will bless you as long as I live; in your name I will lift up my hands." },
    { reference: "Matthew 6:13b", text: "For yours is the kingdom and the power and the glory, forever. Amen." },
  ],
};

/**
 * Get a random scripture for a given phase.
 * @param phaseId - The phase identifier (e.g., 'praise', 'will', 'needs')
 * @param excludeIndex - Optional index to exclude (for refresh functionality)
 * @returns The scripture and its index, or null if phase not found
 */
export function getRandomScripture(
  phaseId: string, 
  excludeIndex?: number
): { scripture: PhaseScripture; index: number } | null {
  const scriptures = phaseScriptures[phaseId];
  if (!scriptures || scriptures.length === 0) return null;
  
  // If only one scripture, return it
  if (scriptures.length === 1) {
    return { scripture: scriptures[0], index: 0 };
  }
  
  // Get available indices (excluding the current one if provided)
  const availableIndices = scriptures
    .map((_, i) => i)
    .filter(i => i !== excludeIndex);
  
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  return { scripture: scriptures[randomIndex], index: randomIndex };
}
