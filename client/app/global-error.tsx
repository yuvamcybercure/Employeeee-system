"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', fontFamily: 'system-ui' }}>
                    <div style={{ maxWidth: '640px', width: '100%', background: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '40px', border: '1px solid #fca5a5' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', marginBottom: '16px' }}>Application Error</h2>
                        <div style={{ background: '#fef2f2', borderRadius: '16px', padding: '24px', border: '1px solid #fecaca' }}>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b', wordBreak: 'break-all' }}>{error.message}</p>
                            {error.stack && (
                                <pre style={{ marginTop: '16px', fontSize: '11px', color: '#dc2626', overflow: 'auto', maxHeight: '240px', whiteSpace: 'pre-wrap' }}>
                                    {error.stack}
                                </pre>
                            )}
                        </div>
                        <button
                            onClick={() => reset()}
                            style={{ marginTop: '24px', padding: '12px 32px', background: '#2563eb', color: '#fff', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
