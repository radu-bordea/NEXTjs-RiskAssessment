import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ownRecordsWhere } from "@/lib/recordAccess"
import SafetyMeetingTable from "./_components/SafetyMeetingTable"

/**
 * SafetyMeetingsDashboardPage — Toolbox Talk dashboard
 *
 * ADMIN / MANAGER → all safety meetings
 * MEMBER (vessel) → only the meetings they created
 */
export default async function SafetyMeetingsDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/sign-in")

  const meetings = await prisma.safetyMeeting.findMany({
    where: ownRecordsWhere(user),
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
    <div className="min-h-screen bg-[#f5f8ff] dark:bg-slate-950">
      <SafetyMeetingTable meetings={meetings} currentUser={user} />
    </div>
  )
}