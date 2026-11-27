import { redirect } from "next/navigation"
import { loadWorkPermitForPage } from "@/lib/workPermitPage"
import PermitFormByType from "../../_components/PermitFormByType"

/**
 * WorkPermitEditPage — ✏️ edit one form permit
 *
 * Location: app/workpermitsdashboard/[id]/edit/page.tsx
 *
 * Rules (client decision):
 *  - DRAFT                  → the vessel that created it + Admin / Manager
 *  - COMPLETED / CLOSED_OUT → ADMIN only (corrections, full validation)
 *  - Uploaded PDFs cannot be edited
 * Not allowed → back to the 👁 view page.
 */
export default async function WorkPermitEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { permit, canEdit } = await loadWorkPermitForPage(id)

  if (!canEdit) redirect(`/workpermitsdashboard/${id}`)

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <PermitFormByType permit={permit} />
    </div>
  )
}