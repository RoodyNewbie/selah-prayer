import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AddRequestDialog } from '@/components/prayer/AddRequestDialog';
import { BottomNav } from '@/components/navigation/BottomNav';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { PullQuote } from '@/components/design/PullQuote';
import { SectionRule } from '@/components/design/SectionRule';
import { ContentSection } from '@/components/layout/ContentSection';
import { ScriptureHero } from '@/components/design/ScriptureHero';
import { storage } from '@/lib/storage';
import { useLastPrayed } from '@/hooks/usePrayerSessions';
import { useAnsweredRequests } from '@/hooks/usePrayerRequests';
import { useAuth } from '@/hooks/useAuth';
import { Plus, BookHeart, LogOut, Settings, Heart, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState, useMemo } from 'react';

const SCRIPTURE_VERSES = [
  { text: "Be still, and know that I am God.", reference: "Psalm 46:10" },
  { text: "The LORD is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "You keep him in perfect peace whose mind is stayed on you.", reference: "Isaiah 26:3" },
  { text: "My presence will go with you, and I will give you rest.", reference: "Exodus 33:14" },
  { text: "In quietness and trust shall be your strength.", reference: "Isaiah 30:15" },
  { text: "The LORD is near to all who call on him.", reference: "Psalm 145:18" },
  { text: "Peace I leave with you; my peace I give to you.", reference: "John 14:27" },
  { text: "Come to me, all who labor and are heavy laden, and I will give you rest.", reference: "Matthew 11:28" },
  { text: "Draw near to God, and he will draw near to you.", reference: "James 4:8" },
  { text: "I am with you always, to the end of the age.", reference: "Matthew 28:20" },
];

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [randomVerse, setRandomVerse] = useState(() => 
    SCRIPTURE_VERSES[Math.floor(Math.random() * SCRIPTURE_VERSES.length)]
  );

  const { data: lastPrayed } = useLastPrayed();
  const { data: answeredRequests = [] } = useAnsweredRequests();

  // Select a new random verse on every mount/page visit
  useEffect(() => {
    setRandomVerse(SCRIPTURE_VERSES[Math.floor(Math.random() * SCRIPTURE_VERSES.length)]);
  }, []);

  // Random testimony for "Testimony of the Day"
  const randomTestimony = useMemo(() => {
    if (answeredRequests.length === 0) return null;
    const index = Math.floor(Math.random() * answeredRequests.length);
    return answeredRequests[index];
  }, [answeredRequests]);

  useEffect(() => {
    storage.initDarkMode();
  }, []);

  const getLastPrayedText = () => {
    if (!lastPrayed) return 'Begin your prayer journey';
    try {
      return `Last prayed ${formatDistanceToNow(new Date(lastPrayed), { addSuffix: true })}`;
    } catch {
      return 'Begin your prayer journey';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="page-background pb-24">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 pt-6 border-b border-border/30">
        <div className="flex items-center gap-2">
          <BookHeart className="w-6 h-6 text-primary drop-shadow-sm" />
          <h1 className="font-display text-2xl text-foreground tracking-wide">Selah</h1>
        </div>
        <div className="flex items-center gap-1">
          <GlobalAudioButton />
          <Button variant="ghost" size="icon" onClick={() => navigate('/history')} className="text-muted-foreground hover:text-foreground">
            <Clock className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 section-stack animate-slide-up pb-8">
        {/* Devotional Opening */}
        <ContentSection className="text-center pt-8 space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/85 font-medium">
            Daily Return
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-wide">
            Peace be with you
          </h2>
          <p className="text-muted-foreground font-body text-sm">
            {getLastPrayedText()}
          </p>
          <SectionRule />
        </ContentSection>

        {/* Scripture Hero */}
        <ContentSection>
          <ScriptureHero text={randomVerse.text} reference={randomVerse.reference} />
        </ContentSection>

        {/* Begin Prayer Invitation */}
        <ContentSection>
          <section className="rounded-2xl border border-border/45 bg-card/35 px-5 py-6 text-center shadow-soft">
            <div className="inline-flex items-center justify-center gap-2 text-primary mb-3">
              <Sparkles className="w-4 h-4" />
              <p className="text-xs uppercase tracking-[0.14em] font-medium">Begin Your Quiet Time</p>
            </div>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-5 max-w-sm mx-auto">
              Pause, breathe, and enter a guided prayer journey in your own words.
            </p>
            <Button
              size="xl"
              onClick={() => navigate('/pray')}
              className="w-full max-w-xs mx-auto"
            >
              Begin Prayer
            </Button>
          </section>
        </ContentSection>

        {/* Quick Actions */}
        <ContentSection className="space-y-3">
          <button
            type="button"
            className="w-full rounded-xl border border-border/45 bg-card/25 px-4 py-4 text-left transition-colors hover:bg-card/40"
            onClick={() => setShowAddRequest(true)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="list-item-accent">
                <p className="font-display text-base text-foreground">Add Prayer Request</p>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  Capture what is on your heart before you begin.
                </p>
              </div>
              <span className="w-9 h-9 rounded-full bg-primary/12 flex items-center justify-center text-primary">
                <Plus className="w-5 h-5" />
              </span>
            </div>
          </button>
        </ContentSection>

        {/* Stone of Remembrance */}
        {randomTestimony && (
          <ContentSection>
            <section
              className="rounded-2xl border border-primary/20 bg-primary/[0.07] p-5 cursor-pointer interactive-lift"
              onClick={() => navigate('/answered')}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-xs uppercase tracking-[0.14em] text-primary font-semibold">
                  Stone of Remembrance
                </p>
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <PullQuote quote={randomTestimony.title} className="pr-1" />
              <div className="mt-3 flex items-center justify-between">
                {randomTestimony.answeredDate ? (
                  <p className="text-xs text-muted-foreground">
                    Answered {formatDistanceToNow(new Date(randomTestimony.answeredDate), { addSuffix: true })}
                  </p>
                ) : (
                  <span />
                )}
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  View stones
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </section>
          </ContentSection>
        )}

        {/* Upgrade Prompt for non-donors */}
        <ContentSection>
          <UpgradePrompt />
        </ContentSection>
      </main>

      <AddRequestDialog
        open={showAddRequest}
        onOpenChange={setShowAddRequest}
      />
      <BottomNav />
    </div>
  );
};

export default Index;
