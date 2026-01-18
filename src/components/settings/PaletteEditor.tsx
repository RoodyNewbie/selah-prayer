import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Palette, Check } from 'lucide-react';
import type { ColorPalette } from '@/contexts/ColorPaletteContext';

interface PaletteEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  palette?: ColorPalette;
  onSave: (palette: Omit<ColorPalette, 'id' | 'isActive'>) => Promise<void>;
}

// Default colors based on current theme
const DEFAULT_PRIMARY = '#4A90A4';
const DEFAULT_ACCENT = '#E8B86D';
const DEFAULT_TINT = '#F5F0E8';

// Validate hex color
function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function PaletteEditor({ open, onOpenChange, palette, onSave }: PaletteEditorProps) {
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const [backgroundTint, setBackgroundTint] = useState(DEFAULT_TINT);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or palette changes
  useEffect(() => {
    if (open) {
      if (palette) {
        setName(palette.name);
        setPrimaryColor(palette.primaryColor);
        setAccentColor(palette.accentColor);
        setBackgroundTint(palette.backgroundTint);
      } else {
        setName('');
        setPrimaryColor(DEFAULT_PRIMARY);
        setAccentColor(DEFAULT_ACCENT);
        setBackgroundTint(DEFAULT_TINT);
      }
      setErrors({});
    }
  }, [open, palette]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 30) {
      newErrors.name = 'Name must be 30 characters or less';
    }

    if (!isValidHex(primaryColor)) {
      newErrors.primaryColor = 'Invalid color format';
    }
    if (!isValidHex(accentColor)) {
      newErrors.accentColor = 'Invalid color format';
    }
    if (!isValidHex(backgroundTint)) {
      newErrors.backgroundTint = 'Invalid color format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        primaryColor,
        accentColor,
        backgroundTint,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            {palette ? 'Edit Palette' : 'Create Palette'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Palette Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ocean Calm"
              maxLength={30}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {name.length}/30 characters
            </p>
          </div>

          {/* Color Pickers */}
          <div className="space-y-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Primary Color
              </label>
              <p className="text-xs text-muted-foreground">
                Used for buttons, links, and key actions
              </p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value.toUpperCase())}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border overflow-hidden"
                  />
                </div>
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value.toUpperCase())}
                  placeholder="#4A90A4"
                  className={`font-mono text-sm flex-1 ${errors.primaryColor ? 'border-destructive' : ''}`}
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Accent Color
              </label>
              <p className="text-xs text-muted-foreground">
                Used for highlights and secondary elements
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value.toUpperCase())}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border overflow-hidden"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value.toUpperCase())}
                  placeholder="#E8B86D"
                  className={`font-mono text-sm flex-1 ${errors.accentColor ? 'border-destructive' : ''}`}
                />
              </div>
            </div>

            {/* Background Tint */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Background Tint
              </label>
              <p className="text-xs text-muted-foreground">
                Subtle color wash over backgrounds
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={backgroundTint}
                  onChange={(e) => setBackgroundTint(e.target.value.toUpperCase())}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border overflow-hidden"
                />
                <Input
                  value={backgroundTint}
                  onChange={(e) => setBackgroundTint(e.target.value.toUpperCase())}
                  placeholder="#F5F0E8"
                  className={`font-mono text-sm flex-1 ${errors.backgroundTint ? 'border-destructive' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Preview
            </label>
            <Card 
              className="p-4 overflow-hidden"
              style={{ 
                backgroundColor: `color-mix(in srgb, ${backgroundTint} 20%, hsl(var(--card)))` 
              }}
            >
              <div className="space-y-3">
                <p 
                  className="font-display text-lg"
                  style={{ color: primaryColor }}
                >
                  Sample Heading
                </p>
                <p className="text-sm text-muted-foreground">
                  This is how your text will look with the selected colors.
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors border-2"
                    style={{ 
                      borderColor: accentColor,
                      color: accentColor,
                    }}
                  >
                    Accent Button
                  </button>
                </div>
                <div 
                  className="flex items-center gap-2 p-2 rounded-md"
                  style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)` }}
                >
                  <Check className="w-4 h-4" style={{ color: accentColor }} />
                  <span className="text-sm">Highlighted content</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : palette ? 'Save Changes' : 'Create Palette'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
