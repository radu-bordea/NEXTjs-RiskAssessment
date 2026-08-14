import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import ObservationPDF from "./ObservationPDF"

/**
 * GET /observationdashboard/observations/[id]/pdf
 *
 * Fetches observation from DB, generates PDF using @react-pdf/renderer
 * and streams it as a file download.
 * Only COMPLETED observations can be downloaded.
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

  const observation = await prisma.observation.findUnique({
    where: { id },
    include: {
      createdBy:      { select: { name: true, email: true } },
      stateUpdatedBy: { select: { name: true } },
    },
  })

  if (!observation) {
    return new NextResponse("Observation not found", { status: 404 })
  }

  // Only COMPLETED observations can be downloaded
  if (observation.state !== "COMPLETED") {
    return new NextResponse("Draft observations cannot be downloaded", { status: 403 })
  }

  // Generate PDF buffer
  const buffer = await renderToBuffer(<ObservationPDF observation={observation} />)
  const uint8Array = new Uint8Array(buffer)

  // Return as downloadable PDF file
  return new NextResponse(uint8Array, {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${observation.title}.pdf"`,
    },
  })
}