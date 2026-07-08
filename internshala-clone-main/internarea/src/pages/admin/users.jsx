import React from "react";
import Head from "next/head";
import ProtectedAdminRoute from "@/components/Admin/ProtectedAdminRoute";

export default function AdminUsersPage() {
  return (
    <ProtectedAdminRoute>
      <Head>
        <title>Users | Admin | InternArea</title>
        <meta name="description" content="Manage users (admin)" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[84px] pb-12">
        <nav className="text-sm text-gray-500 flex items-center gap-2 mb-5">
          <span className="text-gray-400">Admin</span>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Users</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Manage Users
        </h1>
        <p className="mt-2 text-gray-500">
          View, edit and manage all registered users. (Placeholder content)
        </p>

        <section className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Placeholder
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Add user list, search, role controls, and activation/deactivation here.
          </p>
        </section>
      </div>
    </ProtectedAdminRoute>
  );
}
