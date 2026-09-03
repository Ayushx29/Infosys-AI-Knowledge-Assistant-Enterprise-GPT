"use client";

import SearchFilter from "@/components/common/SearchFilter";
import { useState } from "react";

export default function PermissionFilters() {
  const [search, setSearch] = useState("");
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm">

      <SearchFilter placeholder="Search role..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <select className="h-10 rounded-xl border px-4">
        <option>All Roles</option>
        <option>Super Admin</option>
        <option>Admin</option>
        <option>Manager</option>
        <option>Employee</option>
      </select>

    </div>
  );
}
