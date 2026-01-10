import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { PrayerRequest, AnswerType } from '@/lib/prayerData';

export function usePrayerRequests() {
  return useQuery({
    queryKey: ['prayer-requests'],
    queryFn: () => db.getRequests(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useActiveRequests() {
  const query = usePrayerRequests();
  return {
    ...query,
    data: query.data?.filter((r) => !r.isAnswered) ?? [],
  };
}

export function useAnsweredRequests() {
  const query = usePrayerRequests();
  const answered = query.data?.filter((r) => r.isAnswered) ?? [];
  // Sort by answered date, most recent first
  answered.sort((a, b) => {
    const dateA = a.answeredDate ? new Date(a.answeredDate).getTime() : 0;
    const dateB = b.answeredDate ? new Date(b.answeredDate).getTime() : 0;
    return dateB - dateA;
  });
  return {
    ...query,
    data: answered,
  };
}

export function useRecurringRequests() {
  const query = usePrayerRequests();
  return {
    ...query,
    data: query.data?.filter((r) => r.isRecurring && !r.isAnswered) ?? [],
  };
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Omit<PrayerRequest, 'id' | 'createdAt'>) => db.saveRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-requests'] });
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PrayerRequest> }) =>
      db.updateRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-requests'] });
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => db.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-requests'] });
    },
  });
}

export function useMarkAnswered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      note,
      testimony,
      answerType,
      gratitudeNote,
      answeredDate,
    }: {
      id: string;
      note?: string;
      testimony?: string;
      answerType?: AnswerType;
      gratitudeNote?: string;
      answeredDate?: Date;
    }) =>
      db.updateRequest(id, {
        isAnswered: true,
        answeredNote: note,
        answeredDate: answeredDate?.toISOString() || new Date().toISOString(),
        testimony,
        answerType,
        gratitudeNote,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-requests'] });
    },
  });
}
