import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { MAX_PDF_SIZE_BYTES } from "@/lib/validations/workPermit.schema"

/**
 * POST /api/workpermits/upload
 *
 * Location: app/api/workpermits/upload/route.ts
 *
 * Gives the browser a short-lived permission to upload ONE PDF straight to
 * Vercel Blob. The file never passes through our server, so Vercel's
 * ~4.5 MB request limit doesn't apply — scanned PDFs up to 10 MB work.
 *
 * Rules checked here (Vercel Blob enforces them):
 *  - user must be logged in
 *  - only into the workpermits/ folder
 *  - only PDF files, max 10 MB per file
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const { userId } = await auth()
        if (!userId) throw new Error("You must be logged in to upload")

        if (!pathname.startsWith("workpermits/")) {
          throw new Error("Invalid upload location")
        }

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_PDF_SIZE_BYTES,
          addRandomSuffix: true, // two files with the same name never overwrite each other
        }
      },
      // Nothing to do here — the form saves the permit itself after the upload.
      // Kept so older @vercel/blob versions (where this was required) also work.
      onUploadCompleted: async () => {},
    })

    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    )
  }
}