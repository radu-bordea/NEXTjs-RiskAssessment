import { notFound, redirect } from "next/navigation"
import { loadWorkPermitForPage } from "@/lib/workPermitPage"
import PermitFormByType from "../_components/PermitFormByType"

/**
 * WorkPermitViewPage — 👁 view one permit (read-only)
 *
 * Location: app/workpermitsdashboard/[id]/page.tsx
 *
 *  - Uploaded (MANUAL) permit → opens its PDF
 *  - Form permit → the same form, read-only, with an ✏️ Edit button if allowed
 * Members can only open their own vessel's permits (others get 404).
 */
export default async function WorkPermitViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { permit, canEdit } = await loadWorkPermitForPage(id)

  if (permit.source === "MANUAL") {
    if (permit.pdfUrl) redirect(permit.pdfUrl)
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <PermitFormByType permit={permit} readOnly canEdit={canEdit} />
    </div>
  )
}