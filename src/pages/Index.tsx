import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AddRequestDialog } from '@/components/prayer/AddRequestDialog';
import { BottomNav } from '@/components/navigation/BottomNav';
import { storage } from '@/lib/storage';
import { useLastPrayed } from '@/hooks/usePrayerSessions';
import { useAnsweredRequests } from '@/hooks/usePrayerRequests';
import { useAuth } from '@/hooks/useAuth';
import { Plus, BookHeart, LogOut, Settings, Heart, Clock } from 'lucide-react';
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
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-6">
        <div className="flex items-center gap-2">
          <BookHeart className="w-6 h-6 text-primary" />
          <h1 className="font-display text-2xl text-foreground">Selah</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/history')} className="text-muted-foreground">
            <Clock className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-muted-foreground">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 space-y-6 animate-slide-up">
        {/* Welcome Section */}
        <section className="text-center pt-8 pb-4">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            Peace be with you
          </h2>
          <p className="text-muted-foreground font-body">
            {getLastPrayedText()}
          </p>
        </section>

        {/* Start Prayer Card */}
        <Card className="p-6 text-center space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground font-body text-sm">
              Take a moment to pause, breathe, and connect.
            </p>
          </div>
          <Button
            size="xl"
            onClick={() => navigate('/pray')}
            className="w-full max-w-xs mx-auto"
          >
            Begin Prayer
          </Button>
        </Card>

        {/* Quick Add Request */}
        <Card
          className="p-4 flex items-center justify-between cursor-pointer hover:shadow-lifted"
          onClick={() => setShowAddRequest(true)}
        >
          <div>
            <h3 className="font-display text-base text-foreground">Add Prayer Request</h3>
            <p className="text-muted-foreground font-body text-sm">
              Capture what's on your heart
            </p>
          </div>
          <Button variant="warm" size="icon">
            <Plus className="w-5 h-5" />
          </Button>
        </Card>

        {/* Testimony of the Day - Stones of Remembrance */}
        {randomTestimony && (
          <Card 
            className="p-4 bg-primary/5 border-primary/20 cursor-pointer hover:shadow-lifted transition-all"
            onClick={() => navigate('/answered')}
          >
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-primary font-medium mb-1">Stone of Remembrance</p>
                <p className="font-body text-sm text-foreground line-clamp-2">
                  "{randomTestimony.title}"
                </p>
                {randomTestimony.answeredDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Answered {formatDistanceToNow(new Date(randomTestimony.answeredDate), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Scripture of encouragement */}
        <section className="text-center py-6 px-4">
          <blockquote className="font-display text-lg text-foreground/80 italic mb-2">
            "{randomVerse.text}"
          </blockquote>
          <cite className="text-primary font-body text-sm">— {randomVerse.reference}</cite>
        </section>
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
