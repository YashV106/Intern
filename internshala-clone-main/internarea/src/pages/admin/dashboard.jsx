import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Mail, Briefcase, Send, Users, BarChart3, Settings } from "lucide-react";
import { motion } from "framer-motion";

import ProtectedAdminRoute from "@/Components/Admin/ProtectedAdminRoute";
import DashboardStats from "@/Components/Admin/DashboardStats";
import ActionCard from "@/Components/Admin/ActionCard";
import adminService from "@/services/adminService";

const SkeletonCard = ({ variant }) => {
  const base =
    "bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden";
  const bar = "h-1 bg-gray-200";
  return (
    <div className={base}>
      <div className={bar} />
      <div className="p-5">
        <div className="h-4 w-3/5 bg-gray-100 rounded animate-pulse" />
        <div className="mt-3 h-9 w-2/3 bg-gray-100 rounded animate-pulse" />
        <div className="mt-4 h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
        {variant === 2 ? (
          <div className="mt-4 h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
        ) : null}
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const actionCards = useMemo(
    () => [
      {
        icon: Mail,
        title: "View Applications",
        description: "View and manage all applications from candidates",
        href: "/admin/applications",
        color: "bg-blue-600",
      },
      {
        icon: Briefcase,
        title: "Post Job",
        description: "Create and publish new job opportunities",
        href: "/admin/jobs/create",
        color: "bg-green-600",
      },
      {
        icon: Send,
        title: "Post Internship",
        description: "Create and manage internship positions",
        href: "/admin/internships/create",
        color: "bg-purple-600",
      },
      {
        icon: Users,
        title: "Manage Users",
        description: "View and manage user accounts",
        href: "/admin/users",
        color: "bg-orange-600",
      },
      {
        icon: BarChart3,
        title: "Analytics",
        description: "View detailed reports and statistics",
        href: "/admin/analytics",
        color: "bg-red-600",
      },
      {
        icon: Settings,
        title: "Settings",
        description: "Configure system preferences",
        href: "/admin/settings",
        color: "bg-gray-600",
      },
    ],
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await adminService.getAdminDashboard();
      if (mounted) {
        setDashboardStats(res);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ProtectedAdminRoute>
      <Head>
        <title>Admin Dashboard | InternArea</title>
        <meta name="description" content="Admin dashboard" />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[84px] pb-12"
      >
        {/* Breadcrumb + Title */}
        <div className="mb-6">
          <nav className="text-sm text-gray-500 flex items-center gap-2">
            <span className="text-gray-400">Admin</span>
            <span aria-hidden="true">/</span>
            <span className="text-gray-700">Dashboard</span>
          </nav>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-500">
            Manage your jobs, internships, applications and users.
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <SkeletonCard variant={1} />
            <SkeletonCard variant={1} />
            <SkeletonCard variant={2} />
            <SkeletonCard variant={2} />
          </div>
        ) : (
          <DashboardStats stats={dashboardStats} />
        )}

        {/* Action Cards */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
            <p className="text-sm text-gray-500">
              Quick links to manage the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionCards.map((c) => (
              <ActionCard
                key={c.href}
                icon={c.icon}
                title={c.title}
                description={c.description}
                color={c.color}
                href={c.href}
              />
            ))}
          </div>

          <div className="mt-6 text-xs text-gray-400">
            Tip: Admin routes are protected—non-admin users are redirected to
            <Link href="/login" className="text-blue-600 hover:underline ml-2">
              /login
            </Link>
          </div>
        </div>
      </motion.div>
    </ProtectedAdminRoute>
  );
}
