import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RiskPDF from "./RiskPDF";

/**
 * GET /dashboard/risks/[id]/pdf
 *
 * Fetches risk from DB, generates PDF using @react-pdf/renderer
 * and streams it as a file download.
 * Only TEMPLATE and COMPLETED risks can be downloaded.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // Fetch full risk with all nested data
  const risk = await prisma.risk.findUnique({
    where: { id },
    include: {
      assessmentRows: {
        orderBy: { order: "asc" },
        include: {
          additionalMeasures: { orderBy: { order: "asc" } },
        },
      },
      teamMembers: true,
      responsiblePersons: true,
      createdBy: { select: { name: true, email: true } },
      stateUpdatedBy: { select: { name: true } },
    },
  });

  if (!risk) {
    return new NextResponse("Risk not found", { status: 404 });
  }

  // Only TEMPLATE and COMPLETED can be downloaded
  if (risk.state === "DRAFT") {
    return new NextResponse("Draft risks cannot be downloaded", {
      status: 403,
    });
  }

  // Generate PDF buffer
  const buffer = await renderToBuffer(<RiskPDF risk={risk} />);
  const uint8Array = new Uint8Array(buffer);

  // Return as downloadable PDF file
  return new NextResponse(uint8Array, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${risk.ref}.pdf"`,
    },
  });
}
