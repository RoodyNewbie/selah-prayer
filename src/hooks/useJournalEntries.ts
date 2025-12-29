import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { JournalEntry } from '@/lib/prayerData';

export function useJournalEntries() {
  return useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => db.getJournalEntries(),
  });
}

export function useActiveJournalEntries() {
  const { data: entries, ...rest } = useJournalEntries();
  return {
    data: entries?.filter((e) => e.status === 'active'),
    ...rest,
  };
}

export function useFulfilledJournalEntries() {
  const { data: entries, ...rest } = useJournalEntries();
  return {
    data: entries?.filter((e) => e.status === 'fulfilled'),
    ...rest,
  };
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) =>
      db.saveJournalEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<JournalEntry> }) =>
      db.updateJournalEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => db.deleteJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}

export function useMarkFulfilled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      fulfilledNote,
    }: {
      id: string;
      fulfilledNote?: string;
    }) =>
      db.updateJournalEntry(id, {
        status: 'fulfilled',
        fulfilledDate: new Date().toISOString(),
        fulfilledNote,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}
