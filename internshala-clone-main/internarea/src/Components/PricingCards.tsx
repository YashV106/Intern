import React from 'react';

export type PlanKey = 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD';

const plans: Array<{
  key: PlanKey;
  title: string;
  priceINR: number; // monthly
  monthlyLimit: number | null; // null => unlimited
}> = [
  { key: 'FREE', title: 'Free', priceINR: 0, monthlyLimit: 1 },
  { key: 'BRONZE', title: 'Bronze', priceINR: 100, monthlyLimit: 3 },
  { key: 'SILVER', title: 'Silver', priceINR: 300, monthlyLimit: 5 },
  { key: 'GOLD', title: 'Gold', priceINR: 1000, monthlyLimit: null },
];

function formatLimit(limit: number | null) {
  if (limit === null) return 'Unlimited applications';
  return `${limit} applications`;
}

function isWithinPaymentWindowIST(now = new Date()) {
  // Allowed: 10:00 <= time < 11:00 IST
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const istMs = utcMs + 5.5 * 60 * 60_000;
  const ist = new Date(istMs);

  const hours = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();
  return hours === 10 && minutes >= 0 && minutes < 60;
}

export default function PricingCards({
  activePlan,
  onUpgrade,
}: {
  activePlan: PlanKey;
  onUpgrade: (plan: PlanKey) => Promise<void> | void;
}) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);

  const allowed = isWithinPaymentWindowIST(now);

  return (
    <div className="w-full">
      {!allowed && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 10,
            background: '#fff3cd',
            border: '1px solid #ffe69c',
            color: '#8a6d3b',
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Payments are only accepted between <b>10:00 AM</b> and <b>11:00 AM</b> IST. Please come
          back later to upgrade.
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {plans.map((p) => {
          const isCurrent = p.key === activePlan;
          const disabled = !allowed || isCurrent;

          return (
            <div
              key={p.key}
              style={{
                border: isCurrent ? '2px solid #2563eb' : '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 16,
                background: '#fff',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#000000' }}>
                {p.title}
              </div>

              <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 6, color: '#000000' }}>
                ₹{p.priceINR}
                <span style={{ fontSize: 14, fontWeight: 700, color: '#6b7280' }}>/month</span>
              </div>

              <div style={{ color: '#4b5563', marginBottom: 14, fontWeight: 600 }}>
                {formatLimit(p.monthlyLimit)}
              </div>

              <button
                disabled={disabled}
                onClick={() => onUpgrade(p.key)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontWeight: 800,
                  background: disabled ? '#cbd5e1' : '#2563eb',
                  color: 'white',
                  opacity: disabled ? 0.8 : 1,
                }}
              >
                Upgrade Now
              </button>

              {isCurrent && (
                <div style={{ marginTop: 10, color: '#1d4ed8', fontWeight: 700, textAlign: 'center' }}>
                  Current plan
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
