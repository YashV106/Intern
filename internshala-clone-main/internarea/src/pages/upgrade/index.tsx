import React from 'react';
import { useRouter } from 'next/router';
import PricingCards, { PlanKey } from '../../Components/PricingCards';

async function fetchCurrentPlan(): Promise<PlanKey> {
  // Best-effort: adjust these endpoints to match your existing backend auth/profile route.
  const candidates = ['/api/users/me', '/api/profile', '/api/user/profile'];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) continue;
      const data = await res.json();
      const tier = data?.activeTier || data?.subscription?.activeTier || data?.tier;
      if (tier && ['FREE', 'BRONZE', 'SILVER', 'GOLD'].includes(tier)) return tier as PlanKey;
    } catch {
      // ignore
    }
  }
  return 'FREE';
}

export default function UpgradePage() {
  const router = useRouter();
  const [activePlan, setActivePlan] = React.useState<PlanKey>('FREE');
  const [loading, setLoading] = React.useState(true);
  const [busyTier, setBusyTier] = React.useState<PlanKey | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const plan = await fetchCurrentPlan();
      if (mounted) setActivePlan(plan);
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onUpgrade(tier: PlanKey) {
    if (busyTier) return;

    setBusyTier(tier);
    try {
      // Backend endpoint from our module:
      // POST /api/subscription/upgrade/create-checkout-session
      const res = await fetch('/api/subscription/upgrade/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Surface backend error to user
        alert(data?.message || data?.error || 'Upgrade failed');
        return;
      }

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // FREE plan path
      setActivePlan(tier);
    } catch (e: any) {
      alert(e?.message || 'Upgrade failed');
    } finally {
      setBusyTier(null);
    }
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#000000', marginBottom: 12 }}>
        Upgrade Subscription
      </h1>
      <PricingCards
        activePlan={activePlan}
        onUpgrade={async (tier) => {
          // avoid rapid clicks
          if (busyTier) return;
          await onUpgrade(tier);
        }}
      />
      {busyTier && (
        <div style={{ marginTop: 16, color: '#6b7280', fontWeight: 700 }}>
          Processing payment for <b>{busyTier}</b>...
        </div>
      )}
    </div>
  );
}
