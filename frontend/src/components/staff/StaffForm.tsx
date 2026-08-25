import { useState, FormEvent, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { User, Role } from '../../types/user.types';

interface StaffFormProps {
  initialUser?: User;
  isSelf: boolean;
  onSubmit: (payload: { fullName?: string; email?: string; password?: string; role?: Role }) => void;
  isSubmitting: boolean;
}

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN'];

export function StaffForm({ initialUser, isSelf, onSubmit, isSubmitting }: StaffFormProps) {
  const [fullName, setFullName] = useState(initialUser?.fullName ?? '');
  const [email, setEmail] = useState(initialUser?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(initialUser?.role ?? 'CASHIER');

  useEffect(() => {
    if (initialUser) {
      setFullName(initialUser.fullName);
      setEmail(initialUser.email);
      setRole(initialUser.role);
    }
  }, [initialUser]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (initialUser) {
      onSubmit({ fullName, role: isSelf ? undefined : role });
    } else {
      onSubmit({ fullName, email, password, role });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

      {!initialUser && (
        <>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Temporary Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          disabled={isSelf}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {isSelf && <span className="text-xs text-gray-400">You cannot change your own role</span>}
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        {initialUser ? 'Save Changes' : 'Create Staff Account'}
      </Button>
    </form>
  );
}