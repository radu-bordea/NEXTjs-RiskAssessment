import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import SafetyMeetingForm from "../../../_components/SafetyMeetingForm"

/**
 * SafetyMeetingEditPage — Edit an existing DRAFT safety meeting
 *
 * Permission rules match Observation:
 *  - ADMIN/MANAGER → can edit any draft
 *  - MEMBER        → can only edit their own drafts
 *  - COMPLETED meetings cannot be edited — redirects away
 */
export default async function SafetyMeetingEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { id } = await params

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/sign-in")

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

  if (meeting.state !== "DRAFT") {
    redirect(`/safetymeetingsdashboard/meetings/${id}`)
  }

  if (user.role === "MEMBER" && meeting.createdById !== userId) {
    redirect("/safetymeetingsdashboard")
  }

  return (
    <div className="min-h-screen bg-[#fff8f8] dark:bg-slate-950 px-6 md:px-10 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-medium mb-2">
            Edit Draft
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {meeting.projectSurvey}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Complete and submit this draft toolbox talk.
          </p>
        </div>

        <SafetyMeetingForm meeting={meeting} currentUser={user} />
      </div>
    </div>
  )
}