import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string; // tailwind class e.g. "bg-blue-600"
  href?: string;
}

export default function DashboardCard({
  title,
  description,
  icon: Icon,
  color,
  href = "#",
}: DashboardCardProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -4 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative block rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer min-h-[140px] h-full overflow-hidden"
    >
      <div className="p-6 h-full">
        <div className="flex items-center h-full gap-4">
          <div
            className={[
              "flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-sm flex-none",
              color,
            ].join(" ")}
            aria-hidden="true"
          >
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-[#111827] leading-snug">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-5">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div
        className={[
          "absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity",
          color,
        ].join(" ")}
        aria-hidden="true"
      />
    </motion.a>
  );
}
