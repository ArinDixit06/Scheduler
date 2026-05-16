import { useQuery } from '@tanstack/react-query';
import { events } from '../data/mockData';

export function useCalendar() {
  return useQuery({ queryKey: ['calendar'], queryFn: async () => events, initialData: events });
}
