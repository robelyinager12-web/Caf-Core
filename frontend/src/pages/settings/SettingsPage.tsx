import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sun, Moon, Bell, KeyRound } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useThemeStore } from '../../store/themeStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useToastStore } from '../../components/common/Toast';
import { changePassword } from '../../services/authService';
import { getErrorMessage } from '../../utils/validators';

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const toastNotificationsEnabled = usePreferencesStore((state) => state.toastNotificationsEnabled);
  const toggleToastNotifications = usePreferencesStore((state) => state.toggleToastNotifications);
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
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>

      <SettingsSection
        title="Appearance"
        description="Choose how CaféCore looks on this device."
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {theme === 'light' ? (
              <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {theme === 'light' ? 'Light mode' : 'Dark mode'}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Notifications"
        description="Control how new alerts are shown on this device."
      >
        <ToggleRow
          label="Show pop-up toasts"
          description="New order and low-stock alerts always appear in the bell menu regardless of this setting."
          checked={toastNotificationsEnabled}
          onChange={toggleToastNotifications}
        />
      </SettingsSection>

      <SettingsSection title="Change Password" description="Update your account password.">
        <form onSubmit={handlePasswordSubmit} className="flex max-w-sm flex-col gap-4">
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
      </SettingsSection>
    </div>
  );
}