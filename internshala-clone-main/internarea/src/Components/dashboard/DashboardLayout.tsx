import React, { ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  CreditCard,
  ShieldCheck,
  User,
  ChevronDown,
  Menu,
  X,
  MoreVertical,
} from "lucide-react";
import { selectuser } from "@/Feature/Userslice";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const sidebarClasses = "rounded-2xl border border-gray-200 bg-white";

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const user = useSelector(selectuser) as any | null;

  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileAvatarSrc = useMemo(() => user?.photo, [user?.photo]);
  const profileName = useMemo(() => user?.name || "Student", [user?.name]);
  const profileEmail = useMemo(() => user?.email || "", [user?.email]);

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: "Home",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        label: "My Applications",
        href: "/dashboard/applications",
        icon: <Briefcase className="h-5 w-5" />,
      },
      {
        label: "Resume Builder",
        href: "/dashboard/resume",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        label: "Subscription Plans",
        href: "/dashboard/subscription",
        icon: <CreditCard className="h-5 w-5" />,
      },
      {
        label: "Payment History",
        href: "/dashboard/payment-history",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
      {
        label: "Profile",
        href: "/dashboard/profile",
        icon: <User className="h-5 w-5" />,
      },
    ],
    []
  );

  const isActive = (href: string) => {
    const path = router.asPath.split("?")[0];
    return path === href || path.startsWith(href + "/");
  };

  const SidebarContent = (
    <div className={classNames(sidebarClasses, "p-4")}>
      <div className="px-2 py-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
            {profileAvatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileAvatarSrc}
                alt="Student avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-200" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-gray-900 truncate">
              {profileName}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {profileEmail}
            </div>
          </div>
        </div>
      </div>

      <nav
        className="mt-4 space-y-1"
        aria-label="Dashboard navigation"
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={classNames(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={classNames(
                  "transition-colors",
                  active
                    ? "text-white"
                    : "text-blue-700/90 group-hover:text-blue-700"
                )}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={classNames(
              "w-full group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
              "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
            aria-expanded={moreOpen}
          >
            <span className="flex items-center gap-3">
              <MoreVertical className="h-5 w-5 text-gray-700/90 group-hover:text-blue-700 transition-colors" />
              <span className="truncate">More</span>
            </span>
            <ChevronDown
              className={classNames(
                "h-4 w-4 text-gray-400 transition-transform",
                moreOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </button>

          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="ml-2 mt-1"
              >
                <Link
                  href="/dashboard/manage-account"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Manage Account
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 pb-12">
          <aside className="lg:block hidden">{SidebarContent}</aside>

          <main className="min-w-0">
            <div className="relative">
              <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-100 opacity-30 pointer-events-none" />
              <div className="absolute -top-40 -right-20 h-72 w-72 rounded-full bg-indigo-100 opacity-20 pointer-events-none" />
              <div className="relative">{children}</div>
            </div>
          </main>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-2xl bg-blue-600 text-white p-3 shadow-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              aria-label="Close navigation"
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="absolute right-0 top-0 h-full w-[86%] max-w-[340px] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-gray-700">
                  Navigation
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white p-2"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>
              {SidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
