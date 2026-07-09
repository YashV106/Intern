import React from "react";
import Link from "next/link";
import { Briefcase, Mail, Send, Users, BarChart, Settings } from "lucide-react";
import DashboardCard from "@/Components/Admin/DashboardCard";
import StatCard from "@/Components/Admin/StatCard";
import { useLanguage } from "@/context/LanguageContext";

const AdminPanelPage = () => {
  const { t } = useLanguage();
  const stats = [
    {
      label: t("adminPanelTotalApplications"),
      value: "2,345",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      label: t("adminPanelActiveJobs"),
      value: "45",
      change: "+3%",
      changeType: "positive" as const,
    },
    {
      label: t("adminPanelActiveInternships"),
      value: "89",
      change: "+24%",
      changeType: "positive" as const,
    },
    {
      label: t("adminPanelConversionRate"),
      value: "5.25%",
      change: "-1.3%",
      changeType: "negative" as const,
    },
  ];

  const menuItems = [
    {
      title: t("adminPanelViewApplications"),
      description: t("adminPanelViewApplicationsDescription"),
      icon: Mail,
      link: "/applications",
      color: "bg-blue-600",
    },
    {
      title: t("adminPanelPostJob"),
      description: t("adminPanelPostJobDescription"),
      icon: Briefcase,
      link: "/postJob",
      color: "bg-green-600",
    },
    {
      title: t("adminPanelPostInternship"),
      description: t("adminPanelPostInternshipDescription"),
      icon: Send,
      link: "/postInternship",
      color: "bg-purple-600",
    },
    {
      title: t("adminPanelManageUsers"),
      description: t("adminPanelManageUsersDescription"),
      icon: Users,
      link: "/users",
      color: "bg-orange-600",
    },
    {
      title: t("adminPanelAnalytics"),
      description: t("adminPanelAnalyticsDescription"),
      icon: BarChart,
      link: "/analytics",
      color: "bg-red-600",
    },
    {
      title: t("adminPanelSettings"),
      description: t("adminPanelSettingsDescription"),
      icon: Settings,
      link: "/settings",
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("adminPanelTitle")}</h1>
          <p className="mt-2 text-sm font-normal text-gray-500">
            {t("adminPanelDescription")}
          </p>
        </div>

        {/* Stats (identical width/height cards) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              change={s.change}
              changeType={s.changeType}
            />
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Link key={item.title} href={item.link} aria-label={item.title}>
              <DashboardCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                color={item.color}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
