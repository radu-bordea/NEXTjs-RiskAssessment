import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import RiskForm from "../../../_components/RiskForm"

/**
 * EditRiskPage — Edit an existing risk assessment
 *
 * Accessible to ADMIN and MANAGER roles only.
 * Fetches the full risk with all nested data and passes
 * it to RiskForm which handles pre-filling all fields.
 *
 * ADMIN   → can edit + delete
 * MANAGER → can edit only
 */

export default async function EditRiskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  // Check role - only ADMIN and MANGER can edit risks
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    redirect("/dashboard");
  }

  // Fetch full risk with all nested data for pre-filling the form
  const risk = await prisma.risk.findUnique({
    where: { id },
    include: {
      assessmentRows: {
        orderBy: { order: "asc" },
        include: {
          additionalMeasures: {
            orderBy: { order: "asc" },
          },
        },
      },
      teamMembers: true,
      responsiblePersons: true,
    },
  });

  if (!risk) notFound();

  return (
    <div className="min-h-screen bg-[#EEF5F0] dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6 md:px-10 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[#1A7A4A] dark:text-emerald-400 font-medium mb-2">
            Edit Risk Assessment
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {risk.ref}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {risk.state === "DRAFT"
              ? "Complete and submit this draft assessment."
              : "Edit the risk assessment."}
          </p>
        </div>

        {/* Pass risk to RiskForm for pre-filling + currentUser for role checks */}
        <RiskForm currentUser={user} risk={risk} />
      </div>
    </div>
  );
}
