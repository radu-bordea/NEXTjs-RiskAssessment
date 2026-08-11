import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import ObservationForm from "../../../_components/ObservationForm"

/**
 * ObservationEditPage — Edit an existing DRAFT observation
 *
 * Permission rules:
 *  - ADMIN/MANAGER → can edit any draft
 *  - MEMBER        → can only edit their own drafts
 *  - COMPLETED observations cannot be edited — redirects away
 */
export default async function ObservationEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { id } = await params

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/sign-in")

  const observation = await prisma.observation.findUnique({
    where: { id },
    include: {
      createdBy:      { select: { name: true, email: true } },
      stateUpdatedBy: { select: { name: true } },
    },
  })

  if (!observation) notFound()

  // Only DRAFT can be edited
  if (observation.state !== "DRAFT") {
    redirect(`/observationdashboard/observations/${id}`)
  }

  // MEMBER can only edit their own drafts
  if (user.role === "MEMBER" && observation.createdById !== userId) {
    redirect("/observationdashboard")
  }

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950 px-6 md:px-10 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-medium mb-2">
            Edit Draft
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {observation.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Complete and submit this draft observation.
          </p>
        </div>

        <ObservationForm currentUser={user} observation={observation} />
      </div>
    </div>
  )
}