import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import RiskForm from "../../../_components/RiskForm"

/**
 * EditRiskPage — Edit an existing risk assessment
 *
 * Permissions per state:
 *  - TEMPLATE → ADMIN only
 *  - DRAFT    → all roles can edit
 *  - COMPLETED → all roles can edit dates only
 */
export default async function EditRiskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { id } = await params

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/dashboard")

  // Fetch full risk with all nested data
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
      teamMembers:        true,
      responsiblePersons: true,
      createdBy:          { select: { name: true, email: true } },
      stateUpdatedBy:     { select: { name: true } },
    },
  })

  if (!risk) notFound()

  // TEMPLATE — ADMIN only
  if (risk.state === "TEMPLATE" && user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // DRAFT and COMPLETED — all roles allowed

  return (
    <div className="min-h-screen bg-[#EEF5F0] dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6 md:px-10 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[#1A7A4A] dark:text-emerald-400 font-medium mb-2">
            {risk.state === "TEMPLATE" ? "Edit Template" :
             risk.state === "DRAFT"    ? "Edit Draft"    :
                                         "Edit Completed Risk"}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {risk.ref}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {risk.state === "DRAFT"
              ? "Complete and submit this draft assessment."
              : risk.state === "COMPLETED"
              ? "Only initiation date and review date can be modified."
              : "Edit this template."}
          </p>
        </div>

        <RiskForm currentUser={user} risk={risk as any} />
      </div>
    </div>
  )
}