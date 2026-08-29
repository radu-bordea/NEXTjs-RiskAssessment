import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import SafetyMeetingPDF from "./SafetyMeetingPDF"

/**
 * GET /safetymeetingsdashboard/meetings/[id]/pdf
 *
 * Fetches safety meeting from DB, generates PDF using @react-pdf/renderer
 * and streams it as a file download.
 * Only COMPLETED meetings can be downloaded.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

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

  if (!meeting) {
    return new NextResponse("Safety meeting not found", { status: 404 })
  }

  if (meeting.state !== "COMPLETED") {
    return new NextResponse("Draft meetings cannot be downloaded", { status: 403 })
  }

  const buffer = await renderToBuffer(<SafetyMeetingPDF meeting={meeting} />)
  const uint8Array = new Uint8Array(buffer)

  return new NextResponse(uint8Array, {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${meeting.projectSurvey}.pdf"`,
    },
  })
}