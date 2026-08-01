import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import UsersTable from "./_components/UsersTable";

/**
 * AdminUsersPage — Manage user roles
 *
 * Server component — fetches all users from DB.
 * Only accessible to ADMIN role.
 * Redirects non-admin users to dashboard.
 */
export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Check caller is ADMIN
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch all users from DB
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  console.log({ protectedUserId: process.env.PROTECTED_ADMIN_ID, users: users.map(u => u.id) });

  return (
    <div className="min-h-screen bg-[#EEF5F0] dark:bg-slate-950 px-6 md:px-10 py-10 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[#1A7A4A] dark:text-emerald-400 font-medium mb-2">
            Admin Panel
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Manage roles for all users. You cannot change your own role.
          </p>
        </div>

        {/* Users Table */}
        <UsersTable
          users={users}
          currentUserId={currentUser.id}
          protectedUserId={process.env.PROTECTED_ADMIN_ID}
        />
      </div>
    </div>
  );
}
