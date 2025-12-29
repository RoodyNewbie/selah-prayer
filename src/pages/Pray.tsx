import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { prayerPhases, PrayerRequest } from '@/lib/prayerData';
import { db } from '@/lib/db';
import { PhaseProgress } from '@/components/prayer/PhaseProgress';
import { PhaseCard } from '@/components/prayer/PhaseCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, CheckCircle, Repeat, Loader2 } from 'lucide-react';

export default function Pray() {
  const navigate = useNavigate();
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseContent, setPhaseContent] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recurringRequests, setRecurringRequests] = useState<PrayerRequest[]>([]);

  useEffect(() => {
    loadRecurringRequests();
  }, []);

  const loadRecurringRequests = async () => {
    const requests = await db.getRequests();
    setRecurringRequests(requests.filter((r) => r.isRecurring && !r.isAnswered));
  };

  const currentPhase = prayerPhases[currentPhaseIndex];
  const phaseNames = prayerPhases.map((p) => p.name);

  const handleNext = () => {
    if (currentPhaseIndex < prayerPhases.length - 1) {
      setCurrentPhaseIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentPhaseIndex < prayerPhases.length - 1) {
      setCurrentPhaseIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    await db.saveSession(phaseContent);
    setIsSaving(false);
    setIsComplete(true);
  };

  const handleContentChange = (value: string) => {
    setPhaseContent((prev) => ({
      ...prev,
      [currentPhase.id]: value,
    }));
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-6 max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-foreground">Amen</h2>
            <p className="text-muted-foreground font-body">
              Your prayer has been saved. May peace be with you.
            </p>
          </div>
          <Button onClick={() => navigate('/')} size="lg" className="w-full">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <X className="w-5 h-5" />
        </Button>
        <span className="font-display text-lg text-foreground">Prayer Session</span>
        <div className="w-10" />
      </header>

      {/* Progress */}
      <div className="py-4">
        <PhaseProgress
          currentPhase={currentPhaseIndex}
          totalPhases={prayerPhases.length}
          phaseNames={phaseNames}
        />
      </div>

      {/* Phase Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Show recurring requests in the Practical Needs phase */}
        {currentPhase.id === 'needs' && recurringRequests.length > 0 && (
          <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="w-4 h-4 text-primary" />
              <span className="text-sm font-body text-foreground font-medium">
                Your Ongoing Requests
              </span>
            </div>
            <ul className="space-y-2">
              {recurringRequests.map((req) => (
                <li key={req.id} className="text-sm text-muted-foreground font-body">
                  • {req.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <PhaseCard
          key={currentPhase.id}
          phase={currentPhase}
          value={phaseContent[currentPhase.id] || ''}
          onChange={handleContentChange}
          onNext={handleNext}
          onSkip={handleSkip}
          isLast={currentPhaseIndex === prayerPhases.length - 1}
        />

        {isSaving && (
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-body">Saving your prayer...</span>
          </div>
        )}
      </main>
    </div>
  );
}
