"use client";

import { useEffect, useState } from "react";

import {
  Bell,
  Search,
  CalendarDays,
  LogOut,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function Navbar() {
  const [adminName, setAdminName] = useState("Admin");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");

    if (storedName) {
      const updateName = window.setTimeout(() => setAdminName(storedName), 0);
      return () => window.clearTimeout(updateName);
    }
  }, []);

  // Generate initials
  const initials = adminName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    // Clear stored login data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    sessionStorage.clear();

    // Redirect to Frontend Login Page
    window.location.href = "http://localhost:3001/login";
  };

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-8">

        {/* Left */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Dashboard
          </h2>

          <p className="text-sm text-muted-foreground">
            Welcome back, {adminName} 👋
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search documents..."
              className="w-72 rounded-xl pl-10"
            />
          </div>

          {/* Date */}
          <Button
            variant="outline"
            className="rounded-xl"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Today
          </Button>

          {/* Theme */}
          <ThemeToggle />

          {/* Notification */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* Avatar */}
          <div className="relative">

            <button
              onClick={() => setOpen(!open)}
              className="rounded-full"
            >
              <Avatar className="h-11 w-11 cursor-pointer">
                <AvatarFallback className="bg-primary text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-52 rounded-xl border bg-white shadow-lg dark:bg-zinc-900">

                <div className="border-b px-4 py-3">
                  <p className="font-semibold">{adminName}</p>
                  <p className="text-sm text-gray-500">
                    Administrator
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>

              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
