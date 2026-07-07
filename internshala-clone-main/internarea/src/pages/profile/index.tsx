import { selectuser } from "@/Feature/Userslice";
import { ExternalLink, Mail, User as UserIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "@/context/LanguageContext";
import PremiumDashboardLayout from "@/Components/premium/PremiumDashboardLayout";

interface User {
  name: string;
  email: string;
  photo: string;
}

const ProfilePage = () => {
  const { t } = useLanguage();
  const user = useSelector(selectuser) as User | null;

  return (
    <PremiumDashboardLayout>
      <div className="py-6">
        <h1 className="sr-only">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-center">
                {user?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photo}
                    alt={user?.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-7 w-7 text-gray-400" />
                )}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-gray-900 truncate">
                  {user?.name || "User"}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user?.email || ""}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
                    <div className="text-2xl font-extrabold text-gray-900">0</div>
                    <div className="text-xs font-semibold text-gray-600 mt-1">
                      {t("profileActiveApplications")}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
                    <div className="text-2xl font-extrabold text-gray-900">0</div>
                    <div className="text-xs font-semibold text-gray-600 mt-1">
                      {t("profileAcceptedApplications")}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    href="/userapplication"
                    className="inline-flex items-center justify-center w-full md:w-auto px-5 py-2.5 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 transition"
                    aria-label="View applications"
                  >
                    {t("profileViewApplications")}
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-600">
                Manage your plan
              </h2>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <span className="font-extrabold">₹</span>
                </div>

                <div>
                  <div className="text-sm text-gray-500 font-semibold">
                    Subscription
                  </div>
                  <div className="text-lg font-extrabold text-gray-900">
                    Manage your plan
                  </div>
                </div>
              </div>

              <Link
                href="/upgrade"
                className="mt-5 inline-flex items-center justify-center w-full px-4 py-2.5 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 transition"
              >
                View Plans
              </Link>

              <div className="mt-3 text-xs text-gray-600">
                Premium Resume Builder requires an active plan.
              </div>
            </section>

            <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-600">
                Quick Actions
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <Link
                  href="/resume-builder"
                  className="px-4 py-3 rounded-xl bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] transition text-blue-700 font-extrabold"
                >
                  Create Resume
                </Link>

                <Link
                  href="/payment-history"
                  className="px-4 py-3 rounded-xl bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] transition text-blue-700 font-extrabold"
                >
                  Payment History
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PremiumDashboardLayout>
  );
};

export default ProfilePage;
