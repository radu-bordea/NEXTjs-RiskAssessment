"use client";

/**
 * UsersTable — Client component for managing user roles
 *
 * Displays all users in a table with role change buttons.
 * Current user's row is locked — cannot change own role.
 * Uses updateUserRole server action to update roles.
 */

import { useState } from "react";
import { toast } from "sonner";
import { updateUserRole } from "@/app/actions/user.actions";
import { useRouter } from "next/navigation";

type User = {
  id:    string;
  name:  string | null;
  email: string;
  role:  string;
};

type Props = {
  users:         User[];
  currentUserId: string;
};

/** Role badge colors */
const roleBadge: Record<string, string> = {
  ADMIN:   "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MANAGER: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  MEMBER:  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

/** All available roles */
const ROLES = ["ADMIN", "MANAGER", "MEMBER"] as const;

export default function UsersTable({ users, currentUserId }: Props) {
  const router = useRouter();

  /**
   * loadingId — tracks which user's role is currently being updated
   * Used to show loading state on the correct row
   */
  const [loadingId, setLoadingId] = useState<string | null>(null);

  /**
   * handleRoleChange — calls updateUserRole server action
   * Shows toast on success/error and refreshes the page.
   */
  const handleRoleChange = async (
    userId: string,
    newRole: "ADMIN" | "MANAGER" | "MEMBER"
  ) => {
    setLoadingId(userId)
    try {
      const result = await updateUserRole(userId, newRole)
      if (result.success) {
        toast.success("Role updated successfully!")
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to update role")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoadingId(null)
    }
  }

return (
  <div className="rounded-xl overflow-hidden border border-[#A8D5B5] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

    {/* ── Desktop / tablet table (unchanged, hidden on mobile) ── */}
    <table className="w-full text-sm hidden md:table">
      <thead className="bg-[#1A7A4A] dark:bg-[#0d4a2b] border-b border-[#145f39]">
        <tr>
          {["Name", "Email", "Current Role", "Change Role"].map((h) => (
            <th
              key={h}
              className="text-left px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {users.map((user, index) => {
          const isCurrentUser = user.id === currentUserId;
          const isLoading = loadingId === user.id;

          return (
            <tr
              key={user.id}
              className={`border-b border-[#D4EAD9] dark:border-slate-800 last:border-none transition-colors ${
                index % 2 === 0
                  ? "bg-white dark:bg-slate-900"
                  : "bg-[#F5FAF6] dark:bg-slate-900/50"
              } ${isCurrentUser ? "opacity-60" : ""}`}
            >
              <td className="px-2 py-4 font-medium text-slate-800 dark:text-white whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1A7A4A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(user.name ?? user.email)[0].toUpperCase()}
                  </div>
                  <span>{user.name ?? "—"}</span>
                  {isCurrentUser && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF5F0] text-[#1A7A4A] border border-[#A8D5B5] font-medium">
                      You
                    </span>
                  )}
                </div>
              </td>

              <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                {user.email}
              </td>

              <td className="px-4 py-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadge[user.role] ?? ""}`}>
                  {user.role}
                </span>
              </td>

              <td className="px-4 py-4">
                {isCurrentUser ? (
                  <span className="text-xs text-slate-400 dark:text-slate-600">
                    Cannot change own role
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        disabled={user.role === role || isLoading}
                        onClick={() => handleRoleChange(user.id, role)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          user.role === role
                            ? "border-[#1A7A4A] bg-[#1A7A4A] text-white cursor-default"
                            : "border-[#A8D5B5] text-slate-600 dark:text-slate-300 hover:bg-[#EEF5F0] dark:hover:bg-slate-800 disabled:opacity-50"
                        }`}
                      >
                        {isLoading ? "..." : role}
                      </button>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {/* ── Mobile card layout ── */}
    <div className="md:hidden divide-y divide-[#D4EAD9] dark:divide-slate-800">
      {users.map((user) => {
        const isCurrentUser = user.id === currentUserId;
        const isLoading = loadingId === user.id;

        return (
          <div
            key={user.id}
            className={`p-4 ${isCurrentUser ? "opacity-60" : ""}`}
          >
            {/* Name + avatar + You badge */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-[#1A7A4A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(user.name ?? user.email)[0].toUpperCase()}
              </div>
              <span className="font-medium text-slate-800 dark:text-white">
                {user.name ?? "—"}
              </span>
              {isCurrentUser && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF5F0] text-[#1A7A4A] border border-[#A8D5B5] font-medium">
                  You
                </span>
              )}
            </div>

            {/* Full email, wraps instead of clipping */}
            <p className="text-sm text-slate-500 dark:text-slate-400 break-all mb-2 pl-10">
              {user.email}
            </p>

            {/* Role badge */}
            <div className="pl-10 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadge[user.role] ?? ""}`}>
                {user.role}
              </span>
            </div>

            {/* Role change buttons */}
            <div className="pl-10">
              {isCurrentUser ? (
                <span className="text-xs text-slate-400 dark:text-slate-600">
                  Cannot change own role
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      disabled={user.role === role || isLoading}
                      onClick={() => handleRoleChange(user.id, role)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        user.role === role
                          ? "border-[#1A7A4A] bg-[#1A7A4A] text-white cursor-default"
                          : "border-[#A8D5B5] text-slate-600 dark:text-slate-300 hover:bg-[#EEF5F0] dark:hover:bg-slate-800 disabled:opacity-50"
                      }`}
                    >
                      {isLoading ? "..." : role}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
}