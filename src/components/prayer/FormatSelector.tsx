import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePrayerFormats, PrayerFormat } from '@/hooks/usePrayerFormats';
import { builtInFormats, isBuiltInFormat } from '@/lib/builtInFormats';
import { useDonor } from '@/contexts/DonorContext';
import { DonorGate } from '@/components/DonorGate';
import { Check, ChevronDown, Settings2, Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface FormatSelectorProps {
  selectedFormat: PrayerFormat | null;
  onSelectFormat: (format: PrayerFormat | null) => void;
}

export function FormatSelector({ selectedFormat, onSelectFormat }: FormatSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: formats = [], isLoading } = usePrayerFormats();
  const { isDonor, isLoading: isDonorLoading } = useDonor();
  const navigate = useNavigate();

  const currentFormat = selectedFormat || builtInFormats[0];

  const handleSelect = (format: PrayerFormat) => {
    onSelectFormat(format);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <span className="text-sm font-body">{currentFormat.name}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Choose Prayer Format</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Built-in Formats - Always available */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                Built-in Formats
              </h3>
              {builtInFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleSelect(format)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                    'hover:bg-muted/50 border border-transparent',
                    currentFormat.id === format.id && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-body font-medium text-foreground">
                        {format.name}
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {format.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {format.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format.phases.length} phases
                    </p>
                  </div>
                  {currentFormat.id === format.id && (
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Formats - Donor only */}
            <div className="space-y-2 pt-2 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                Custom Formats
                {!isDonor && !isDonorLoading && <Lock className="w-3 h-3" />}
              </h3>
              
              {isLoading || isDonorLoading ? (
                <div className="py-4 text-center text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : isDonor ? (
                formats.length > 0 ? (
                  formats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => handleSelect(format)}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                        'hover:bg-muted/50 border border-transparent',
                        currentFormat.id === format.id && 'border-primary bg-primary/5'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-body font-medium text-foreground">
                            {format.name}
                          </span>
                        </div>
                        {format.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {format.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format.phases.length} phases
                        </p>
                      </div>
                      {currentFormat.id === format.id && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-2 px-1">
                    No custom formats yet. Create one in Settings.
                  </p>
                )
              ) : (
                <DonorGate featureName="Custom Prayer Formats" />
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                setOpen(false);
                navigate('/settings');
              }}
            >
              <Settings2 className="w-4 h-4" />
              Manage Formats
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
