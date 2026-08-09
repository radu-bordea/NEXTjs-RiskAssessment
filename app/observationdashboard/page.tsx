import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ObservationTable from "./_components/ObservationTable"

/**
 * ObservationDashboardPage — Observation Card dashboard
 *
 * Server component — fetches all observations from DB.
 * Accessible to all authenticated roles.
 */
export default async function ObservationDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/sign-in")

  // Fetch all observations, most recent first
  const observations = await prisma.observation.findMany({
    orderBy: { date: "desc" },
    select: {
      id:                     true,
      title:                  true,
      observationDescription: true,
      vesselProject:          true,
      date:                   true,
      state:                  true,
    },
  })

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <ObservationTable observations={observations} currentUser={user} />
    </div>
  )
}