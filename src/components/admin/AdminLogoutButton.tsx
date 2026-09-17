"use client";

import { LogOut } from "lucide-react";
import { adminLogoutAction } from "@/lib/actions/auth";

export function AdminLogoutButton() {
  return (
    <form action={adminLogoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </form>
  );
}
