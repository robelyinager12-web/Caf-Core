import { getErrorMessage } from '../../utils/validators';

interface QueryErrorProps {
  error: unknown;
  onRetry: () => void;
}

export function QueryError({ error, onRetry }: QueryErrorProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p>{getErrorMessage(error)}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 font-medium underline underline-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
