import React from 'react';
import { useRouter } from 'next/router';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Best-effort re-fetch profile for global state update.
    // Integrate with your existing auth/profile API + state management.
    (async () => {
      try {
        const candidates = ['/api/users/me', '/api/profile', '/api/user/profile'];
        for (const url of candidates) {
          const res = await fetch(url, { credentials: 'include' });
          if (res.ok) {
            // If you have a global store, update it here instead of ignoring.
            break;
          }
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Payment Successful ✅</h1>

      <div style={{ maxWidth: 720, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <p style={{ margin: 0, color: '#374151', fontWeight: 650 }}>
          Your subscription has been activated. An invoice (with plan details) has been emailed to you.
        </p>

        {session_id ? (
          <p style={{ marginTop: 10, color: '#6b7280' }}>
            Checkout session: <code>{String(session_id)}</code>
          </p>
        ) : null}

        <button
          style={{
            marginTop: 16,
            background: '#2563eb',
            color: '#fff',
            fontWeight: 800,
            border: 'none',
            padding: '10px 14px',
            borderRadius: 10,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
          onClick={() => router.push('/profile')}
          disabled={loading}
        >
          Go to Profile
        </button>
      </div>
    </div>
  );
}
