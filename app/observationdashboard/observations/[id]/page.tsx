import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import ObservationView from "../../_components/ObservationView"

/**
 * ObservationViewPage — Read-only view of a single observation
 *
 * Accessible to all authenticated roles.
 */
export default async function ObservationViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { id } = await params

  const observation = await prisma.observation.findUnique({
    where: { id },
    include: {
      createdBy:      { select: { name: true, email: true } },
      stateUpdatedBy: { select: { name: true } },
    },
  })

  if (!observation) notFound()

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <ObservationView observation={observation} />
    </div>
  )
}