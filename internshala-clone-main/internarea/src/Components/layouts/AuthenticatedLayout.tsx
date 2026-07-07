import React from "react";
import Navbar from "@/Components/Navbar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </header>
      {/* Navbar height is 64px (h-16). */}
      <div className="pt-16">{children}</div>
    </div>
  );
}
