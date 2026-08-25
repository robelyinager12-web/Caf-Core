import { Pencil, UserX, UserCheck } from 'lucide-react';
import clsx from 'clsx';
import { User } from '../../types/user.types';
import { formatDate } from '../../utils/formatDate';

interface StaffTableProps {
  users: User[];
  currentUserId?: string;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
}

export function StaffTable({ users, currentUserId, onEdit, onToggleActive }: StaffTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {user.fullName} {isSelf && <span className="text-xs text-gray-400">(You)</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      user.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {user.createdAt ? formatDate(user.createdAt) : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="rounded-lg bg-gray-50 p-1.5 text-gray-600 hover:bg-gray-100"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleActive(user)}
                      disabled={isSelf}
                      title={isSelf ? "You can't deactivate your own account" : undefined}
                      className={clsx(
                        'rounded-lg p-1.5',
                        isSelf
                          ? 'cursor-not-allowed bg-gray-50 text-gray-300'
                          : user.isActive
                          ? 'bg-danger/10 text-danger hover:bg-danger/20'
                          : 'bg-success/10 text-success hover:bg-success/20'
                      )}
                    >
                      {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}