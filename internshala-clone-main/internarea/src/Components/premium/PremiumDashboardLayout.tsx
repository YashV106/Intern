import React, { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  CreditCard,
  ShieldCheck,
  User,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/profile",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Resume Builder",
    href: "/resume-builder",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Internship Applications",
    href: "/applications",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    label: "Subscription Plans",
    href: "/upgrade",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    label: "Payment History",
    href: "/payment-history",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  { label: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
];

export default function PremiumDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const user = useSelector(selectuser) as any | null;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 pb-12">
          {/* Sidebar */}
          <aside className="lg:block hidden" aria-label="Sidebar navigation">
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
              <div className="px-2 py-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-[#e5e7eb] bg-[#f3f4f6] flex items-center justify-center">
                    {user?.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.photo}
                        alt="User avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-[#e5e7eb]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-gray-900 truncate">
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user?.email || ""}
                    </div>
                  </div>
                </div>
              </div>

              <nav className="mt-4 space-y-1" aria-label="Dashboard navigation">
                {navItems.map((item) => {
                  const active =
                    router.pathname === item.href || router.asPath === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#f9fafb]",
                        active
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-[#f3f4f6] hover:text-gray-900",
                      ].join(" ")}
                      aria-current={active ? "page" : undefined}
                    >
                      <span
                        className={[
                          "transition-colors",
                          active
                            ? "text-white"
                            : "text-blue-700/90 group-hover:text-blue-700",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0" aria-label="Main content">
            <div className="relative">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
