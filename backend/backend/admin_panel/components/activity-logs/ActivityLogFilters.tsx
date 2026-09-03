"use client";

import SearchFilter from "@/components/common/SearchFilter";
import { useState } from "react";

export default function ActivityLogFilters() {
  const [search, setSearch] = useState("");
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm">

      <SearchFilter placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="flex gap-3">

        <select className="h-10 rounded-xl border px-4">
          <option>All Actions</option>
          <option>Login</option>
          <option>Create</option>
          <option>Update</option>
          <option>Delete</option>
        </select>

        <select className="h-10 rounded-xl border px-4">
          <option>All Status</option>
          <option>Success</option>
          <option>Failed</option>
        </select>

      </div>

    </div>
  );
}
