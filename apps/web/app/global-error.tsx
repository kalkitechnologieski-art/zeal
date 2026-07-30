'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
          <p className="mt-2 text-gray-600">{error.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={reset}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Please check the Vercel function logs for more details.
          </p>
        </div>
      </body>
    </html>
  );
}
