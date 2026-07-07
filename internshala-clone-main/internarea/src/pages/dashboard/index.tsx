import React from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "@/Components/dashboard/DashboardLayout";
import { selectuser } from "@/Feature/Userslice";
import Link from "next/link";
import { Briefcase, CreditCard, ShieldCheck, FileText } from "lucide-react";

export default function DashboardHomePage() {
  // Keep existing functionality (if user info exists); UI-only cards
  const user = useSelector(selectuser) as any | null;

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Welcome, {user?.name || "Student"}
            </h1>
            <p className="mt-1 text-sm md:text-base text-gray-600">
              Quick actions and your premium overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/applications"
              className="px-4 py-2 rounded-2xl bg-white/60 border border-white/60 hover:bg-white/80 transition text-blue-700 font-bold inline-flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4" />
              My Applications
            </Link>
            <Link
              href="/dashboard/resume"
              className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition font-bold inline-flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Resume Builder
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(37,99,235,0.06)] p-6 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-100 blur-2xl opacity-60 pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-500">Applications</div>
                <div className="text-lg font-extrabold text-gray-900">Track status & manage applications</div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/applications"
                className="inline-flex items-center gap-2 text-blue-700 font-bold hover:text-blue-800 transition"
              >
                View timeline
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(37,99,235,0.06)] p-6 overflow-hidden relative">
            <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-indigo-100 blur-2xl opacity-60 pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-500">Premium</div>
                <div className="text-lg font-extrabold text-gray-900">Build premium resumes & unlock plans</div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center gap-2 text-blue-700 font-bold hover:text-blue-800 transition"
              >
                View subscription
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(37,99,235,0.06)] p-6 overflow-hidden relative">
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-cyan-100 blur-2xl opacity-60 pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-500">Payments</div>
                <div className="text-lg font-extrabold text-gray-900">Invoices & transaction history</div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/payment-history"
                className="inline-flex items-center gap-2 text-blue-700 font-bold hover:text-blue-800 transition"
              >
                Payment history
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Keep existing content minimal: no backend logic changes */}
        <div className="mt-6 rounded-3xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(37,99,235,0.06)] p-6">
          <div className="text-sm font-bold text-gray-600">Navigation tips</div>
          <ul className="mt-3 text-sm text-gray-700 space-y-2">
            <li>• Use the profile drawer to switch between sections without full reload.</li>
            <li>• Premium Resume Builder is available for eligible users only.</li>
            <li>• Payment time restrictions are enforced during the payment step.</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
