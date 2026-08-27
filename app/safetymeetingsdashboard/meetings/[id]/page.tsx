import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import SafetyMeetingView from "../../_components/SafetyMeetingView"

/**
 * SafetyMeetingViewPage — Read-only view of a single toolbox talk
 *
 * Accessible to all authenticated roles.
 */
export default async function SafetyMeetingViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { id } = await params

  const meeting = await prisma.safetyMeeting.findUnique({
    where: { id },
    include: {
      createdBy:      { select: { name: true, email: true } },
      stateUpdatedBy: { select: { name: true } },
      teamMembers:    true,
      selectedCards: {
        include: {
          card: true,
        },
      },
    },
  })

  if (!meeting) notFound()

  return (
    <div className="min-h-screen bg-[#fff8f8] dark:bg-slate-950">
      <SafetyMeetingView meeting={meeting} />
    </div>
  )
}