import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { canAccessRecord } from "@/lib/recordAccess"
import { hotWorkDraftSchema } from "@/lib/validations/hotWorkPermit.schema"
import { confinedSpaceDraftSchema } from "@/lib/validations/confinedSpacePermit.schema"
import { workingAloftDraftSchema } from "@/lib/validations/workingAloftPermit.schema"
import { ConfinedSpacePDF, HotWorkPDF, WorkingAloftPDF } from "./WorkPermitPDF"
import type { PdfPermitInfo } from "./permitPdfParts"

/**
 * GET /workpermitsdashboard/[id]/pdf
 *
 * Location: app/workpermitsdashboard/[id]/pdf/route.tsx
 *
 * Same pattern as the Risk / Observation PDF routes:
 * loads the permit, renders it with @react-pdf/renderer and returns it as a download.
 *
 *  - Members: only their own vessel's permits (others → 404)
 *  - Form permits only, and not DRAFT (uploaded permits already are a PDF)
 *  - File name = permit number, e.g. "HW-2026-004.pdf"
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("Unauthorized", { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { id } = await params
  const permit = await prisma.workPermit.findUnique({
    where: { id },
    select: {
      id: true,
      permitNo: true,
      type: true,
      source: true,
      state: true,
      vessel: true,
      projectVoyage: true,
      issueDate: true,
      details: true,
      pdfUrl: true,
      createdById: true,
      closedOutAt: true,
      createdBy: { select: { name: true, email: true } },
      closedOutBy: { select: { name: true, email: true } },
    },
  })

  // Same answer for "missing" and "another vessel's permit"
  if (!permit || !canAccessRecord(user, permit)) {
    return new NextResponse("Permit not found", { status: 404 })
  }

  // Uploaded permit → just send the browser to its PDF
  if (permit.source === "MANUAL") {
    if (!permit.pdfUrl) return new NextResponse("Permit not found", { status: 404 })
    return NextResponse.redirect(permit.pdfUrl)
  }

  if (permit.state === "DRAFT") {
    return new NextResponse("Draft permits cannot be downloaded", { status: 403 })
  }

  const info: PdfPermitInfo = {
    permitNo: permit.permitNo,
    state: permit.state,
    vessel: permit.vessel,
    projectVoyage: permit.projectVoyage,
    issueDate: permit.issueDate,
    createdByName: permit.createdBy.name ?? permit.createdBy.email,
    closedOutAt: permit.closedOutAt,
    closedOutByName: permit.closedOutBy ? (permit.closedOutBy.name ?? permit.closedOutBy.email) : null,
  }

  // Read the saved answers with the form's own schema, so the PDF gets the right shape
  let document
  if (permit.type === "HOT_WORK") {
    const parsed = hotWorkDraftSchema.safeParse(permit.details)
    if (parsed.success) document = <HotWorkPDF permit={info} f={parsed.data} />
  } else if (permit.type === "CONFINED_SPACE") {
    const parsed = confinedSpaceDraftSchema.safeParse(permit.details)
    if (parsed.success) document = <ConfinedSpacePDF permit={info} f={parsed.data} />
  } else if (permit.type === "WORKING_ALOFT") {
    const parsed = workingAloftDraftSchema.safeParse(permit.details)
    if (parsed.success) document = <WorkingAloftPDF permit={info} f={parsed.data} />
  }

  if (!document) {
    console.error(`Work permit PDF: could not read the saved form of ${permit.permitNo}`)
    return new NextResponse("This permit's data could not be read", { status: 500 })
  }

  const buffer = await renderToBuffer(document)

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${permit.permitNo}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}