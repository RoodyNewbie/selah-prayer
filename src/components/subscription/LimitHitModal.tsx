import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface LimitHitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'generation' | 'history' | 'feature';
}

const SESSION_KEY = 'selah_limit_modal_shown';

export function LimitHitModal({ open, onOpenChange, type = 'generation' }: LimitHitModalProps) {
  const navigate = useNavigate();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if modal was already shown this session
    const shown = sessionStorage.getItem(SESSION_KEY);
    setShouldShow(!shown);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    onOpenChange(false);
  };

  const handleSupport = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    onOpenChange(false);
    navigate('/settings?scroll=support');
  };

  // Don't show if already shown this session
  if (!shouldShow && !open) return null;

  const titles: Record<string, string> = {
    generation: "You've reached today's limit",
    history: 'History limit reached',
    feature: 'Premium feature',
  };

  const descriptions: Record<string, string> = {
    generation: 'Free users get 5 prayer generations per day. Supporters get 20 daily generations plus custom audio, colors, and more.',
    history: 'Free users can view the last 30 days of prayer history. Supporters get unlimited history access.',
    feature: 'This feature is available for supporters. Unlock custom audio, colors, meditation timer, and more.',
  };

  return (
    <Dialog open={open && shouldShow} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{titles[type]}</DialogTitle>
          <DialogDescription className="text-center">
            {descriptions[type]}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleClose}>
            Maybe Later
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleSupport}>
            Support Selah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
