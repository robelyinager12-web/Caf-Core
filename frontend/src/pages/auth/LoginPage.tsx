import { useState, FormEvent } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useLogin } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/validators';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900">Sign in</h2>

      <Input
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@cafeteria.local"
        required
        autoFocus
      />

      <Input
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      {loginMutation.isError && (
        <p className="text-sm text-danger">{getErrorMessage(loginMutation.error)}</p>
      )}

      <Button type="submit" isLoading={loginMutation.isPending} className="mt-2 w-full">
        Sign in
      </Button>
    </form>
  );
}