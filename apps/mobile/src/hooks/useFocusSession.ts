import { useFocusStore } from '../store/focusStore';

export function useFocusSession() {
  return useFocusStore();
}
