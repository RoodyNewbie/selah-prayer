import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';

export function usePrayerSessions() {
  return useQuery({
    queryKey: ['prayer-sessions'],
    queryFn: () => db.getSessions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLastPrayed() {
  return useQuery({
    queryKey: ['last-prayed'],
    queryFn: () => db.getLastPrayed(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phases, generatedPrayer, formatId }: { 
      phases: Record<string, string>; 
      generatedPrayer?: string;
      formatId?: string;
    }) => db.saveSession(phases, generatedPrayer, formatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['last-prayed'] });
    },
  });
}

export function useUpdateSessionPrayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, generatedPrayer }: { sessionId: string; generatedPrayer: string }) =>
      db.updateSessionPrayer(sessionId, generatedPrayer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-sessions'] });
    },
  });
}
