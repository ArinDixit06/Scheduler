import { useQuery } from '@tanstack/react-query';
import { habits } from '../data/mockData';

export function useHabits() {
  return useQuery({ queryKey: ['habits'], queryFn: async () => habits, initialData: habits });
}
