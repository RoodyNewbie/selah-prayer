import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Heart, ArrowRight } from 'lucide-react';
import { useDonor } from '@/contexts/DonorContext';

export function UpgradePrompt() {
  const navigate = useNavigate();
  const { isDonor, isLoading } = useDonor();

  // Don't show for donors or while loading
  if (isDonor || isLoading) {
    return null;
  }

  return (
    <Card 
      className="p-4 bg-muted/30 border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => navigate('/settings?scroll=support')}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/80">
            Enjoying Selah? Consider supporting the app
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
}
