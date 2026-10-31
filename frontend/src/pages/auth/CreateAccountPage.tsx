import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export function CreateAccountPage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10">
        <UserPlus className="h-5 w-5" />
      </span>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Staff account access
      </h2>
      <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
        Staff accounts and roles are created by the system administrator. Please contact your
        administrator to get an account. Self-registration is not available.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
      >
        Staff sign in
      </Link>
      <Link
        to="/"
        className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Back to café home
      </Link>
    </div>
  );
}
