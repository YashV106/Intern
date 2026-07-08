import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Simple count-up hook for numeric values (handles integers/decimals and ignores %/% sign formatting)
function useCountUp(target, durationMs = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const numericTarget = typeof target === "number" ? target : Number(target);
    if (Number.isNaN(numericTarget)) return;

    let raf = 0;
    const start = performance.now();
    const from = 0;

    const step = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      // EaseOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const nextVal = from + (numericTarget - from) * eased;
      setValue(nextVal);
      if (t < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

export default function DashboardStats({ stats }) {
  const normalized = useMemo(() => {
    // expects:
    // totalApplications, activeJobs, activeInternships (numbers)
    // conversionRate (number, e.g. 5.25)
    return {
      totalApplications: Number(stats?.totalApplications ?? 0),
      activeJobs: Number(stats?.activeJobs ?? 0),
      activeInternships: Number(stats?.activeInternships ?? 0),
      conversionRate: Number(stats?.conversionRate ?? 0),
    };
  }, [stats]);

  const n1 = useCountUp(normalized.totalApplications, 950);
  const n2 = useCountUp(normalized.activeJobs, 850);
  const n3 = useCountUp(normalized.activeInternships, 950);
  const n4 = useCountUp(normalized.conversionRate, 900);

  const loading = !stats;

  const cards = [
    {
      label: "Total Applications",
      value: loading ? "—" : new Intl.NumberFormat().format(Math.round(n1)),
      change: "+12%",
      accent: "bg-blue-50 text-blue-700",
      accentLine: "bg-blue-500",
      changePositive: true,
    },
    {
      label: "Active Jobs",
      value: loading ? "—" : new Intl.NumberFormat().format(Math.round(n2)),
      change: "+3%",
      accent: "bg-green-50 text-green-700",
      accentLine: "bg-green-500",
      changePositive: true,
    },
    {
      label: "Active Internships",
      value: loading ? "—" : new Intl.NumberFormat().format(Math.round(n3)),
      change: "+24%",
      accent: "bg-purple-50 text-purple-700",
      accentLine: "bg-purple-500",
      changePositive: true,
    },
    {
      label: "Conversion Rate",
      value: loading ? "—" : `${n4.toFixed(2)}%`,
      change: "-1.3%",
      accent: "bg-red-50 text-red-700",
      accentLine: "bg-red-500",
      changePositive: false,
      percentIndicator: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((c, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: idx * 0.03 }}
          whileHover={{ scale: 1.015 }}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className={`h-1 ${c.accentLine}`} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-gray-500">{c.label}</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900">
                  {c.value}
                </div>
              </div>

              <div className={`flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${c.accent}`}>
                <span className={c.changePositive ? "text-green-700" : "text-red-700"}>
                  {c.change}
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              {idx === 3 ? "Week over week performance" : "Latest update summary"}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
