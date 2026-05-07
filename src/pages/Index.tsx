import { useNavigate } from 'react-router-dom';
import { AddRequestDialog } from '@/components/prayer/AddRequestDialog';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  const { signOut } = useAuth();
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [randomVerse, setRandomVerse] = useState(
    () => SCRIPTURE_VERSES[Math.floor(Math.random() * SCRIPTURE_VERSES.length)]
  );

  const { data: lastPrayed } = useLastPrayed();
  const { data: answeredRequests = [] } = useAnsweredRequests();
  const { data: recurringRequests = [] } = useRecurringRequests();

  // Refresh verse on every visit
  useEffect(() => {
    setRandomVerse(SCRIPTURE_VERSES[Math.floor(Math.random() * SCRIPTURE_VERSES.length)]);
  }, []);

  // Pick a testimony to surface as the day's stone
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="page-background pb-28">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-6 pb-3">
        <div className="flex items-center gap-2">
          <BookHeart className="w-5 h-5 text-primary drop-shadow-sm" />
          <h1 className="font-display text-[1.4rem] text-foreground tracking-wide">Selah</h1>
        </div>
        <div className="flex items-center gap-1">
          <GlobalAudioButton />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/history')}
            className="text-muted-foreground hover:text-foreground"
            aria-label="History"
          >
            <Clock className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="relative z-10 animate-slide-up space-y-7 pb-6">
        {/* Scripture Plate */}
        <ContentSection className="pt-4">
          <ScriptureHero text={randomVerse.text} reference={randomVerse.reference} />
        </ContentSection>

        {/* Begin Prayer — featured asymmetric tile */}
        <ContentSection>
          <BeginPrayerTile onClick={() => navigate('/pray')} meta={lastPrayedMeta} />
        </ContentSection>

        {/* Ongoing Threads */}
        {recurringRequests.length > 0 && (
          <ContentSection>
            <ThreadsStrip threads={recurringRequests} />
          </ContentSection>
        )}

        {/* Stone of Remembrance — pull-quote */}
        {randomTestimony && (
          <ContentSection>
            <StoneOfRemembranceQuote
              stone={randomTestimony}
              onClick={() => navigate('/answered')}
            />
          </ContentSection>
        )}

        {/* Quick add request — quiet utility row */}
        <ContentSection>
          <button
            type="button"
            onClick={() => setShowAddRequest(true)}
            className="w-full flex flex-col items-center gap-2 py-3 px-1 group"
          >
            <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="w-4 h-4" />
            </span>
            <span className="text-center">
              <span className="block font-body text-[14px] text-foreground">
                Add a prayer request
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Capture what is on your heart
              </span>
            </span>
          </button>
        </ContentSection>

        {/* Donor invitation — preserved */}
        <ContentSection>
          <UpgradePrompt />
        </ContentSection>
      </main>

      <AddRequestDialog open={showAddRequest} onOpenChange={setShowAddRequest} />
      <BottomNav />
    </div>
  );
};

export default Index;
