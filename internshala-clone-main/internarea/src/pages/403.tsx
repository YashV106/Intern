import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 pt-[96px] pb-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-red-50 flex items-center justify-center">
            <Lock className="h-5 w-5 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">403 Unauthorized</h1>
        </div>

        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          You don’t have permission to access this page.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
