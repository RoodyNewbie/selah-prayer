import { Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useGlobalAudio, AudioTrack } from '@/contexts/AudioContext';
import { useCustomAudioTracks } from '@/hooks/useCustomAudioTracks';
import { useDonor } from '@/contexts/DonorContext';

const BUILT_IN_TRACKS: { value: AudioTrack; label: string }[] = [
  { value: 'silence', label: 'Silence' },
  { value: 'rain', label: 'Rain and Thunder' },
  { value: 'piano', label: 'Soft Ambience' },
];

export function GlobalAudioButton() {
  const { settings, isPlaying, changeTrack, changeVolume, toggleEnabled, playCustomTrack, isCustomTrack } = useGlobalAudio();
  const { isDonor } = useDonor();
  const { data: customTracks = [] } = useCustomAudioTracks(isDonor);
  
  const isSilent = !settings.enabled || settings.track === 'silence' || !isPlaying;

  // Check if current track is a custom track
  const isCurrentCustom = isCustomTrack(settings.track);
  const currentCustomTrack = customTracks.find(t => t.id === settings.track);

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
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-foreground">Background Audio</h4>
            <Switch
              checked={settings.enabled}
              onCheckedChange={toggleEnabled}
              aria-label="Toggle background audio"
            />
          </div>
          
          {/* Built-in Track Options */}
          <div className={cn("space-y-1", !settings.enabled && "opacity-50 pointer-events-none")}>
            {BUILT_IN_TRACKS.map((option) => (
              <button
                key={option.value}
                onClick={() => changeTrack(option.value)}
                disabled={!settings.enabled}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  settings.track === option.value && !isCurrentCustom
                    ? "bg-primary/10 text-primary"
                    : "text-foreground"
                )}
              >
                <span>{option.label}</span>
                {settings.track === option.value && !isCurrentCustom && (
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

          {/* Custom Tracks Section (Donors only) */}
          {isDonor && customTracks.length > 0 && (
            <>
              <Separator />
              <div className={cn("space-y-1", !settings.enabled && "opacity-50 pointer-events-none")}>
                <p className="text-xs text-muted-foreground px-3 pb-1 flex items-center gap-1.5">
                  <Music className="w-3 h-3" />
                  Your Tracks
                </p>
                {customTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => playCustomTrack({ id: track.id, name: track.name, filePath: track.filePath })}
                    disabled={!settings.enabled}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      settings.track === track.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground"
                    )}
                  >
                    <span className="truncate">{track.name}</span>
                    {settings.track === track.id && (
                      <svg
                        className="w-4 h-4 flex-shrink-0"
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
            </>
          )}

          {/* Volume Slider */}
          <div className={cn(
            "space-y-2 pt-2 border-t border-border",
            (!settings.enabled || settings.track === 'silence') && "opacity-50 pointer-events-none"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Volume</span>
              <span className="text-sm text-muted-foreground">{settings.volume}%</span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={(value) => changeVolume(value[0])}
              max={100}
              min={0}
              step={1}
              className="w-full"
              disabled={!settings.enabled || settings.track === 'silence'}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
