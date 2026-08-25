import { LogIn, LogOut, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clockIn, clockOut } from '../../services/staffService';
import { useMyShiftStatus } from '../../hooks/useMyShiftStatus';
import { useToastStore } from '../common/Toast';
import { getErrorMessage } from '../../utils/validators';

export function ShiftClockWidget() {
  const { data: activeShift, isLoading } = useMyShiftStatus();
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['my-shift-status'] });
    queryClient.invalidateQueries({ queryKey: ['active-staff'] });
  }

  const clockInMutation = useMutation({
    mutationFn: () => clockIn(),
    onSuccess: () => {
      invalidate();
      showToast('Clocked in — have a great shift!');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const clockOutMutation = useMutation({
    mutationFn: () => clockOut(),
    onSuccess: () => {
      invalidate();
      showToast('Clocked out — see you next time!');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  if (isLoading) return null;

  if (activeShift) {
    return (
      <button
        onClick={() => clockOutMutation.mutate()}
        disabled={clockOutMutation.isPending}
        className="flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 disabled:opacity-60"
        title={`Clocked in since ${new Date(activeShift.shiftStart).toLocaleTimeString()}`}
      >
        <Clock className="h-3.5 w-3.5" />
        On Shift
        <LogOut className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => clockInMutation.mutate()}
      disabled={clockInMutation.isPending}
      className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-60"
    >
      <LogIn className="h-3.5 w-3.5" />
      Clock In
    </button>
  );
}