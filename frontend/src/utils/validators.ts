export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    };

    const data = axiosError.response?.data;

    // The backend's errorHandler (Phase 6) attaches field-level Zod errors
    // under `errors` — e.g. { password: ["must contain an uppercase
    // letter"] } — alongside the generic `message` ("Validation failed").
    // Surface the specific field message when present, since "Validation
    // failed" alone gives no actionable information.
    if (data?.errors) {
      const firstFieldErrors = Object.values(data.errors)[0];
      if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
        return firstFieldErrors[0];
      }
    }

    return data?.message ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}