import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { getActiveStaff } from '../../services/staffService';

function elapsedSince(start: string): string {
  const minutes = Math.floor((Date.now() - new Date(start).getTime()) / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function ActiveStaffPanel() {
  const { data: activeShifts, isLoading } = useQuery({
    queryKey: ['active-staff'],
    queryFn: getActiveStaff,
    refetchInterval: 60000,
  });

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Clock className="h-4 w-4 text-primary-600" />
        Currently On Shift
      </h2>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : activeShifts && activeShifts.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {activeShifts.map((shift) => (
            <li
              key={shift.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-gray-800">{shift.user.fullName}</p>
                <p className="text-xs text-gray-500">{shift.user.role}</p>
              </div>
              <span className="text-xs text-gray-400">{elapsedSince(shift.shiftStart)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No staff currently clocked in.</p>
      )}
    </div>
  );
}