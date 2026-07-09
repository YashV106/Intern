import React from "react";

export type StatCardChangeType = "positive" | "negative";

export interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeType: StatCardChangeType;
}

export default function StatCard({
  label,
  value,
  change,
  changeType,
}: StatCardProps) {
  const isPositive = changeType === "positive";

  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 h-full flex items-center">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-500 truncate">
              {label}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900 leading-tight">
              {value}
            </div>
          </div>

          <div
            className={[
              "font-bold text-lg",
              isPositive ? "text-green-600" : "text-red-600",
            ].join(" ")}
          >
            {change}
          </div>
        </div>
      </div>
    </div>
  );
}
