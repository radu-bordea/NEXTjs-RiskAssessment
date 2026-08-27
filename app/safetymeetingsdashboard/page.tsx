import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import SafetyMeetingTable from "./_components/SafetyMeetingTable"

/**
 * SafetyMeetingsDashboardPage — Toolbox Talk dashboard
 *
 * Server component — fetches all safety meetings from DB.
 */
export default async function SafetyMeetingsDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/sign-in")

  const meetings = await prisma.safetyMeeting.findMany({
    orderBy: { date: "desc" },
    select: {
      id:                 true,
      projectSurvey:      true,
      vesselInstallation: true,
      activityTask:       true,
      toolboxTalkLeader:  true,
      date:               true,
      state:              true,
      createdById:        true,
    },
  })

  return (
    <div className="min-h-screen bg-[#fff8f8] dark:bg-slate-950">
      <SafetyMeetingTable meetings={meetings} currentUser={user} />
    </div>
  )
}