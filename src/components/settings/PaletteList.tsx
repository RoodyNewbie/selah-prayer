import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useColorPalette, ColorPalette } from '@/contexts/ColorPaletteContext';
import { PaletteEditor } from './PaletteEditor';
import { Plus, Check, Pencil, Trash2, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

function PaletteSwatches({ palette, size = 'md' }: { palette: ColorPalette; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className="flex -space-x-1">
      <div 
        className={cn(sizeClass, 'rounded-full border-2 border-background')}
        style={{ backgroundColor: palette.primaryColor }}
      />
      <div 
        className={cn(sizeClass, 'rounded-full border-2 border-background')}
        style={{ backgroundColor: palette.accentColor }}
      />
      <div 
        className={cn(sizeClass, 'rounded-full border-2 border-background')}
        style={{ backgroundColor: palette.backgroundTint }}
      />
    </div>
  );
}

export function PaletteList() {
  const { 
    palettes, 
    activePalette, 
    canAddMore, 
    applyPalette, 
    savePalette, 
    updatePalette, 
    deletePalette,
    resetToDefault,
  } = useColorPalette();
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPalette, setEditingPalette] = useState<ColorPalette | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<ColorPalette | null>(null);

  const handleCreate = () => {
    setEditingPalette(undefined);
    setEditorOpen(true);
  };

  const handleEdit = (palette: ColorPalette) => {
    setEditingPalette(palette);
    setEditorOpen(true);
  };

  const handleSave = async (paletteData: Omit<ColorPalette, 'id' | 'isActive'>) => {
    if (editingPalette) {
      await updatePalette(editingPalette.id, paletteData);
    } else {
      await savePalette(paletteData);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deletePalette(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Palette Indicator */}
      {activePalette && (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PaletteSwatches palette={activePalette} />
              <div>
                <p className="font-medium text-sm text-foreground">
                  {activePalette.name}
                </p>
                <p className="text-xs text-primary">Currently active</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefault}
              className="text-xs"
            >
              Reset to Default
            </Button>
          </div>
        </Card>
      )}

      {/* Palette List */}
      {palettes.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Palette className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            No custom palettes yet
          </p>
          <Button variant="warm" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Palette
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {palettes.map((palette) => (
            <Card 
              key={palette.id} 
              className={cn(
                "p-3 transition-colors",
                palette.isActive && "bg-primary/5 border-primary/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PaletteSwatches palette={palette} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">
                        {palette.name}
                      </p>
                      {palette.isActive && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!palette.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyPalette(palette.id)}
                      className="text-xs h-8"
                    >
                      Apply
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(palette)}
                    className="h-8 w-8"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirm(palette)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create New Button */}
      {palettes.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {palettes.length} of 5 palettes used
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreate}
            disabled={!canAddMore}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            New Palette
          </Button>
        </div>
      )}

      {!canAddMore && (
        <p className="text-xs text-muted-foreground text-center">
          You've reached the maximum of 5 palettes. Delete one to create a new one.
        </p>
      )}

      {/* Editor Dialog */}
      <PaletteEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        palette={editingPalette}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Palette?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteConfirm?.name}". 
              {deleteConfirm?.isActive && ' Your colors will be reset to default.'}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
