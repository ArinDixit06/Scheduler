import { useQuery } from '@tanstack/react-query';
import { tasks } from '../data/mockData';

export function useTasks() {
  return useQuery({ queryKey: ['tasks'], queryFn: async () => tasks, initialData: tasks });
}
