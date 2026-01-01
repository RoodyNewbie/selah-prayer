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
import { Check, ChevronDown, Settings2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface FormatSelectorProps {
  selectedFormat: PrayerFormat | null;
  onSelectFormat: (format: PrayerFormat | null) => void;
}

export function FormatSelector({ selectedFormat, onSelectFormat }: FormatSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: formats = [], isLoading } = usePrayerFormats();
  const navigate = useNavigate();

  // Combine built-in formats with user formats
  const allFormats = [...builtInFormats, ...formats];
  const currentFormat = selectedFormat || builtInFormats[0];

  const handleSelect = (format: PrayerFormat) => {
    onSelectFormat(isBuiltInFormat(format.id) ? null : format);
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

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading formats...
              </div>
            ) : (
              allFormats.map((format) => (
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
                      {format.isSystem && (
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      )}
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
            )}
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
