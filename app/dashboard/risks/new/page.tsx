import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import RiskForm from "../../_components/RiskForm";
import Link from "next/link";

export default async function NewRiskPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-6 md:px-10 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 mb-6 transition-colors"
          >
            ← Back to Risks
          </Link>
          <p className="text-xs uppercase tracking-widest text-[#1D9E75] font-medium mb-2">
            New Risk Assessment
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Create Risk Assessment
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Fill in all required fields and submit.
          </p>
        </div>
        <RiskForm currentUser={user} />
      </div>
    </div>
  );
}
