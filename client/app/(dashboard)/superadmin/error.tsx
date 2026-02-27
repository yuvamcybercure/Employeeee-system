"use client";

import { useEffect } from 'react';

export default function SuperadminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Superadmin page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-10 space-y-6 border border-red-100">
                <h2 className="text-2xl font-black text-red-600">Dashboard Error</h2>
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                    <p className="text-sm font-bold text-red-800 break-all">{error.message}</p>
                    {error.stack && (
                        <pre className="mt-4 text-xs text-red-600 overflow-auto max-h-60 whitespace-pre-wrap">
                            {error.stack}
                        </pre>
                    )}
                </div>
                <button
                    onClick={() => reset()}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
