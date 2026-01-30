import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { AudioTrack, AudioSettings } from '@/lib/audioUtils';

interface AudioControlButtonProps {
  settings: AudioSettings;
  isPlaying: boolean;
  onTrackChange: (track: AudioTrack) => void;
  onVolumeChange: (volume: number) => void;
}

const TRACK_OPTIONS: { value: AudioTrack; label: string }[] = [
  { value: 'silence', label: 'Silence' },
  { value: 'rain', label: 'Rain and Thunder' },
  { value: 'piano', label: 'Soft Ambience' },
];

export function AudioControlButton({
  settings,
  isPlaying,
  onTrackChange,
  onVolumeChange,
}: AudioControlButtonProps) {
  const isSilent = settings.track === 'silence' || !isPlaying;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Background audio settings"
        >
          {isSilent ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-foreground">Background Audio</h4>
          
          {/* Track Options */}
          <div className="space-y-1">
            {TRACK_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onTrackChange(option.value)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  settings.track === option.value
                    ? "bg-primary/10 text-primary"
                    : "text-foreground"
                )}
              >
                <span>{option.label}</span>
                {settings.track === option.value && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Volume</span>
              <span className="text-sm text-muted-foreground">{settings.volume}%</span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={(value) => onVolumeChange(value[0])}
              max={100}
              min={0}
              step={1}
              className="w-full"
              disabled={settings.track === 'silence'}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
