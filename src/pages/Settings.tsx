import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  usePrayerFormats,
  useCreateFormat,
  useDeleteFormat,
  useSetDefaultFormat,
  PrayerFormat,
} from '@/hooks/usePrayerFormats';
import { prayerPhases, PrayerPhase } from '@/lib/prayerData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  ArrowLeft,
  Plus,
  Star,
  Trash2,
  Sparkles,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Settings() {
  const navigate = useNavigate();
  const { data: formats = [], isLoading } = usePrayerFormats();
  const createFormat = useCreateFormat();
  const deleteFormat = useDeleteFormat();
  const setDefaultFormat = useSetDefaultFormat();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Create format form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPhases, setNewPhases] = useState<PrayerPhase[]>([...prayerPhases]);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  const handleCreateFormat = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    if (newPhases.length === 0) {
      toast.error('Please add at least one phase');
      return;
    }

    try {
      await createFormat.mutateAsync({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        phases: newPhases,
      });
      toast.success('Format created!');
      setShowCreateDialog(false);
      resetForm();
    } catch (err) {
      toast.error('Failed to create format');
    }
  };

  const handleDeleteFormat = async (id: string) => {
    try {
      await deleteFormat.mutateAsync(id);
      toast.success('Format deleted');
    } catch (err) {
      toast.error('Failed to delete format');
    }
    setDeleteConfirm(null);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultFormat.mutateAsync(id);
      toast.success('Default format updated');
    } catch (err) {
      toast.error('Failed to update default');
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewDescription('');
    setNewPhases([...prayerPhases]);
    setExpandedPhase(null);
  };

  const updatePhase = (index: number, updates: Partial<PrayerPhase>) => {
    setNewPhases(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const removePhase = (index: number) => {
    setNewPhases(prev => prev.filter((_, i) => i !== index));
  };

  const addPhase = () => {
    const newPhase: PrayerPhase = {
      id: `custom-${Date.now()}`,
      name: 'New Phase',
      description: 'Describe this phase',
      prompts: ['What would you like to pray about?'],
    };
    setNewPhases(prev => [...prev, newPhase]);
    setExpandedPhase(newPhases.length);
  };

  const movePhase = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newPhases.length) return;
    
    const updated = [...newPhases];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setNewPhases(updated);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 pt-6 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-display text-xl text-foreground">Settings</h1>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Appearance Section */}
        <section>
          <h2 className="font-display text-lg text-foreground mb-4">Appearance</h2>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {document.documentElement.classList.contains('dark') ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-body font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </Card>
        </section>

        {/* Prayer Formats Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-foreground">Prayer Formats</h2>
            <Button
              variant="warm"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
          </div>

          <div className="space-y-3">
            {/* Built-in format */}
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-body font-medium text-foreground">
                      Lord's Prayer
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Traditional structure • {prayerPhases.length} phases
                  </p>
                </div>
              </div>
            </Card>

            {isLoading ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Loading formats...
              </p>
            ) : (
              formats.map((format) => (
                <Card key={format.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-body font-medium text-foreground">
                          {format.name}
                        </span>
                        {format.isDefault && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format.description || 'Custom format'} • {format.phases.length} phases
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!format.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefault(format.id)}
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(format.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}

            {!isLoading && formats.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Create custom formats to personalize your prayer time
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Create Format Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Create Prayer Format</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My Prayer Format"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="A brief description of this format..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Phases</label>
                <Button variant="ghost" size="sm" onClick={addPhase} className="gap-1">
                  <Plus className="w-3 h-3" />
                  Add Phase
                </Button>
              </div>

              <div className="space-y-2">
                {newPhases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedPhase(expandedPhase === index ? null : index)}
                      className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 font-medium text-sm">{phase.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); movePhase(index, 'up'); }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); movePhase(index, 'down'); }}
                          disabled={index === newPhases.length - 1}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </button>

                    {expandedPhase === index && (
                      <div className="p-3 pt-0 space-y-3 border-t border-border">
                        <Input
                          value={phase.name}
                          onChange={(e) => updatePhase(index, { name: e.target.value })}
                          placeholder="Phase name"
                        />
                        <Input
                          value={phase.description}
                          onChange={(e) => updatePhase(index, { description: e.target.value })}
                          placeholder="Brief description"
                        />
                        <Textarea
                          value={phase.prompts.join('\n')}
                          onChange={(e) => updatePhase(index, { prompts: e.target.value.split('\n').filter(p => p.trim()) })}
                          placeholder="Prompts (one per line)"
                          rows={3}
                        />
                        {newPhases.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removePhase(index)}
                            className="w-full"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove Phase
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFormat} disabled={createFormat.isPending}>
              {createFormat.isPending ? 'Creating...' : 'Create Format'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Format?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this prayer format.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteFormat(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
