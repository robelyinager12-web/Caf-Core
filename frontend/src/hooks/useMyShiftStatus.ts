import { useQuery } from '@tanstack/react-query';
import { getShifts } from '../services/staffService';
import { useAuthStore } from '../store/authStore';

/**
 * Determines whether the current user has an open shift by checking their
 * own recent shifts for one with no shiftEnd — there's no dedicated
 * "am I clocked in" endpoint, so this reuses the general /staff/shifts
 * listing filtered to self, which every role is already permitted to
 * implicitly need for their own header widget.
 */
export function useMyShiftStatus() {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['my-shift-status', userId],
    queryFn: async () => {
      const shifts = await getShifts({ userId, activeOnly: true });
      return shifts[0] ?? null;
    },
    enabled: !!userId,
    refetchInterval: 60000,
  });
}