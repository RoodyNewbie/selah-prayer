import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDonor } from '@/contexts/DonorContext';
import { toast } from 'sonner';

export interface ColorPalette {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundTint: string;
  isActive: boolean;
}

interface ColorPaletteContextType {
  palettes: ColorPalette[];
  activePalette: ColorPalette | null;
  isLoading: boolean;
  applyPalette: (paletteId: string) => Promise<void>;
  savePalette: (palette: Omit<ColorPalette, 'id' | 'isActive'>) => Promise<void>;
  updatePalette: (id: string, updates: Partial<Omit<ColorPalette, 'id' | 'isActive'>>) => Promise<void>;
  deletePalette: (id: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  canAddMore: boolean;
  refetch: () => Promise<void>;
}

const ColorPaletteContext = createContext<ColorPaletteContextType | undefined>(undefined);

// Helper to convert hex to HSL values for CSS variables
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Apply colors to DOM
function applyColorsToDOM(palette: ColorPalette | null) {
  const root = document.documentElement;
  
  if (palette) {
    // Convert hex to HSL for CSS variables
    const primaryHsl = hexToHsl(palette.primaryColor);
    const accentHsl = hexToHsl(palette.accentColor);
    const tintHsl = hexToHsl(palette.backgroundTint);
    
    root.style.setProperty('--custom-primary', primaryHsl);
    root.style.setProperty('--custom-accent', accentHsl);
    root.style.setProperty('--custom-background-tint', tintHsl);
    root.classList.add('custom-palette-active');
  } else {
    root.style.removeProperty('--custom-primary');
    root.style.removeProperty('--custom-accent');
    root.style.removeProperty('--custom-background-tint');
    root.classList.remove('custom-palette-active');
  }
}

export function ColorPaletteProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isDonor, isLoading: isDonorLoading } = useDonor();
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activePalette = palettes.find(p => p.isActive) || null;
  const canAddMore = palettes.length < 5;

  const fetchPalettes = useCallback(async () => {
    if (!user || !isDonor) {
      setPalettes([]);
      applyColorsToDOM(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('color_palettes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mapped: ColorPalette[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        primaryColor: row.primary_color,
        accentColor: row.accent_color,
        backgroundTint: row.background_tint,
        isActive: row.is_active,
      }));

      setPalettes(mapped);
      
      // Apply active palette
      const active = mapped.find(p => p.isActive);
      applyColorsToDOM(active || null);
    } catch (error) {
      console.error('Error fetching palettes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isDonor]);

  useEffect(() => {
    if (!isDonorLoading) {
      fetchPalettes();
    }
  }, [fetchPalettes, isDonorLoading]);

  // Reset colors when donor status changes to false
  useEffect(() => {
    if (!isDonorLoading && !isDonor) {
      applyColorsToDOM(null);
    }
  }, [isDonor, isDonorLoading]);

  const applyPalette = async (paletteId: string) => {
    if (!user) return;

    try {
      // First, set all palettes to inactive
      await supabase
        .from('color_palettes')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Then set the selected palette to active
      await supabase
        .from('color_palettes')
        .update({ is_active: true })
        .eq('id', paletteId);

      // Update local state
      setPalettes(prev => prev.map(p => ({
        ...p,
        isActive: p.id === paletteId,
      })));

      const palette = palettes.find(p => p.id === paletteId);
      if (palette) {
        applyColorsToDOM({ ...palette, isActive: true });
        toast.success(`Palette applied: ${palette.name}`);
      }
    } catch (error) {
      console.error('Error applying palette:', error);
      toast.error('Failed to apply palette');
    }
  };

  const savePalette = async (palette: Omit<ColorPalette, 'id' | 'isActive'>) => {
    if (!user) return;

    if (palettes.length >= 5) {
      toast.error("You've reached the maximum of 5 palettes");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('color_palettes')
        .insert({
          user_id: user.id,
          name: palette.name.trim(),
          primary_color: palette.primaryColor,
          accent_color: palette.accentColor,
          background_tint: palette.backgroundTint,
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newPalette: ColorPalette = {
        id: data.id,
        name: data.name,
        primaryColor: data.primary_color,
        accentColor: data.accent_color,
        backgroundTint: data.background_tint,
        isActive: data.is_active,
      };

      setPalettes(prev => [...prev, newPalette]);
      toast.success('Palette created!');
    } catch (error) {
      console.error('Error saving palette:', error);
      toast.error('Failed to save palette');
    }
  };

  const updatePalette = async (id: string, updates: Partial<Omit<ColorPalette, 'id' | 'isActive'>>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name.trim();
      if (updates.primaryColor !== undefined) updateData.primary_color = updates.primaryColor;
      if (updates.accentColor !== undefined) updateData.accent_color = updates.accentColor;
      if (updates.backgroundTint !== undefined) updateData.background_tint = updates.backgroundTint;

      const { error } = await supabase
        .from('color_palettes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setPalettes(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));

      // If updating the active palette, reapply colors
      const updated = palettes.find(p => p.id === id);
      if (updated?.isActive) {
        applyColorsToDOM({ ...updated, ...updates, isActive: true });
      }

      toast.success('Palette updated!');
    } catch (error) {
      console.error('Error updating palette:', error);
      toast.error('Failed to update palette');
    }
  };

  const deletePalette = async (id: string) => {
    try {
      const paletteToDelete = palettes.find(p => p.id === id);
      
      const { error } = await supabase
        .from('color_palettes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPalettes(prev => prev.filter(p => p.id !== id));

      // If deleting the active palette, reset to default
      if (paletteToDelete?.isActive) {
        applyColorsToDOM(null);
      }

      toast.success('Palette deleted');
    } catch (error) {
      console.error('Error deleting palette:', error);
      toast.error('Failed to delete palette');
    }
  };

  const resetToDefault = async () => {
    if (!user) return;

    try {
      // Set all palettes to inactive
      await supabase
        .from('color_palettes')
        .update({ is_active: false })
        .eq('user_id', user.id);

      setPalettes(prev => prev.map(p => ({ ...p, isActive: false })));
      applyColorsToDOM(null);
      toast.success('Colors reset to default');
    } catch (error) {
      console.error('Error resetting to default:', error);
      toast.error('Failed to reset colors');
    }
  };

  return (
    <ColorPaletteContext.Provider
      value={{
        palettes,
        activePalette,
        isLoading,
        applyPalette,
        savePalette,
        updatePalette,
        deletePalette,
        resetToDefault,
        canAddMore,
        refetch: fetchPalettes,
      }}
    >
      {children}
    </ColorPaletteContext.Provider>
  );
}

export function useColorPalette() {
  const context = useContext(ColorPaletteContext);
  if (context === undefined) {
    throw new Error('useColorPalette must be used within a ColorPaletteProvider');
  }
  return context;
}
