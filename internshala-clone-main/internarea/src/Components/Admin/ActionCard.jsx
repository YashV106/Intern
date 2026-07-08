import React from "react";
import { motion } from "framer-motion";

export default function ActionCard({
  icon: Icon,
  title,
  description,
  color = "bg-blue-600",
  href,
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ translateY: -2 }}
      whileTap={{ translateY: 0 }}
      className="group relative block rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer min-h-[120px]"
    >
      <div className="p-6 h-full">
        <div className="flex items-center gap-4 h-full">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${color} text-white shadow-sm flex-none`}
            aria-hidden="true"
          >
            {Icon ? <Icon className="h-6 w-6" /> : null}
          </div>

          <div className="min-w-0">
            <h3 className="text-[24px] leading-[1.25] font-semibold text-[#111827]">
              {title}
            </h3>
            <p className="mt-2 text-[16px] leading-6 text-[#6B7280]">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 h-[2px] ${color} opacity-0 group-hover:opacity-100 transition-opacity`}
        aria-hidden="true"
      />
    </motion.a>
  );
}
