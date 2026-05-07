import { useNavigate } from 'react-router-dom';
import { AddRequestDialog } from '@/components/prayer/AddRequestDialog';
import { BottomNav } from '@/components/navigation/BottomNav';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { ContentSection } from '@/components/layout/ContentSection';
import { ScriptureHero } from '@/components/design/ScriptureHero';
import { BeginPrayerTile } from '@/components/home/BeginPrayerTile';
import { ThreadsStrip } from '@/components/home/ThreadsStrip';
import { StoneOfRemembranceQuote } from '@/components/home/StoneOfRemembranceQuote';
import { storage } from '@/lib/storage';
import { useLastPrayed } from '@/hooks/usePrayerSessions';
import { useAnsweredRequests, useRecurringRequests } from '@/hooks/usePrayerRequests';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState, useMemo } from 'react';

const SCRIPTURE_VERSES = [
  { text: 'Be still, and know that I am God.', reference: 'Psalm 46:10' },
  { text: 'The LORD is my shepherd; I shall not want.', reference: 'Psalm 23:1' },
  { text: 'You keep him in perfect peace whose mind is stayed on you.', reference: 'Isaiah 26:3' },
  { text: 'My presence will go with you, and I will give you rest.', reference: 'Exodus 33:14' },
  { text: 'In quietness and trust shall be your strength.', reference: 'Isaiah 30:15' },
  { text: 'The LORD is near to all who call on him.', reference: 'Psalm 145:18' },
  { text: 'Peace I leave with you; my peace I give to you.', reference: 'John 14:27' },
  { text: 'Come to me, all who labor and are heavy laden, and I will give you rest.', reference: 'Matthew 11:28' },
  { text: 'Draw near to God, and he will draw near to you.', reference: 'James 4:8' },
  { text: 'I am with you always, to the end of the age.', reference: 'Matthew 28:20' },
];

const Index = () => {
  const navigate = useNavigate();
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [randomVerse, setRandomVerse] = useState(
    () => SCRIPTURE_VERSES[Math.floor(Math.random() * SCRIPTURE_VERSES.length)]
  );

  const { data: lastPrayed } = useLastPrayed();
  const { data: answeredRequests = [] } = useAnsweredRequests();
  const { data: recurringRequests = [] } = useRecurringRequests();

  useEffect(() => {
    setRandomVerse(SCRIPTURE_VERSES[Math.floor(Math.random() * SCRIPTURE_VERSES.length)]);
  }, []);

  const randomTestimony = useMemo(() => {
    if (answeredRequests.length === 0) return null;
    const idx = Math.floor(Math.random() * answeredRequests.length);
    return answeredRequests[idx];
  }, [answeredRequests]);

  useEffect(() => {
    storage.initDarkMode();
  }, []);

  const lastPrayedMeta = useMemo(() => {
    if (!lastPrayed) return undefined;
    try {
      return `Last prayed ${formatDistanceToNow(new Date(lastPrayed), { addSuffix: true })}`;
    } catch {
      return undefined;
    }
  }, [lastPrayed]);

  return (
    <div className="page-background pb-28">
      <header className="relative z-10 flex items-center justify-between px-5 pt-8 pb-3">
        <h1 className="font-display text-[26px] font-medium text-foreground">Selah</h1>
        <div className="flex items-center gap-1">
          <GlobalAudioButton />
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" aria-label="Settings">
            <Link to="/settings"><SettingsIcon className="w-5 h-5" /></Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 animate-slide-up space-y-7 pb-6">
        <ContentSection className="pt-2">
          <ScriptureHero text={randomVerse.text} reference={randomVerse.reference} />
        </ContentSection>

        <ContentSection>
          <BeginPrayerTile onClick={() => navigate('/pray')} meta={lastPrayedMeta} />
        </ContentSection>

        {recurringRequests.length > 0 && (
          <ContentSection>
            <ThreadsStrip threads={recurringRequests} />
          </ContentSection>
        )}

        {randomTestimony && (
          <ContentSection>
            <StoneOfRemembranceQuote
              stone={randomTestimony}
              onClick={() => navigate('/answered')}
            />
          </ContentSection>
        )}
      </main>

      <AddRequestDialog open={showAddRequest} onOpenChange={setShowAddRequest} />
      <BottomNav />
    </div>
  );
};

export default Index;
