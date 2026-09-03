import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, Mail, Shield, User as UserIcon } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../components/common/Toast';
import { changePassword } from '../../services/authService';
import { getErrorMessage } from '../../utils/validators';

function initials(fullName?: string): string {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.show);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      showToast('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setConfirmError('');

    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Account</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">Dashboard &gt; Account</p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-500">
            {initials(user?.fullName)}
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 dark:border-gray-800 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-gray-800">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-gray-800">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Role</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-gray-800">
              <UserIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Full Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.fullName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Update your account password.
        </p>

        <form onSubmit={handlePasswordSubmit} className="mt-4 flex max-w-sm flex-col gap-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={confirmError || undefined}
          />
          <Button type="submit" isLoading={changePasswordMutation.isPending} className="mt-1">
            <KeyRound className="h-4 w-4" />
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}