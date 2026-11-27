import { notFound } from "next/navigation"
import HotWorkPermitForm from "./HotWorkPermitForm"
import ConfinedSpacePermitForm from "./ConfinedSpacePermitForm"
import WorkingAloftPermitForm from "./WorkingAloftPermitForm"
import type { LoadedWorkPermit } from "@/lib/workPermitPage"

/**
 * PermitFormByType — opens a saved FORM permit in the right form (server component)
 *
 * Location: app/workpermitsdashboard/_components/PermitFormByType.tsx
 *
 * Used by the 👁 view page (readOnly) and the ✏️ edit page.
 * The saved answers (`details` JSON) are passed to the form as its starting values.
 */
export default function PermitFormByType({
  permit,
  readOnly = false,
  canEdit = false,
}: {
  permit: LoadedWorkPermit
  readOnly?: boolean
  canEdit?: boolean
}) {
  const details = permit.details && typeof permit.details === "object" && !Array.isArray(permit.details) ? permit.details : {}

  const existing = {
    id: permit.id,
    permitNo: permit.permitNo,
    state: permit.state,
    createdByName: permit.createdBy.name ?? permit.createdBy.email,
    closedOutAt: permit.closedOutAt?.toISOString() ?? null,
    closedOutByName: permit.closedOutBy ? (permit.closedOutBy.name ?? permit.closedOutBy.email) : null,
  }
  // Vessel = the one SAVED with the permit (not the Admin who opens it)
  const common = { vessel: permit.vessel, readOnly, canEdit }

  switch (permit.type) {
    case "HOT_WORK":
      // details = the JSON saved by this same form, so it has the form's shape
      return <HotWorkPermitForm {...common} permit={{ ...existing, form: details as never }} />
    case "CONFINED_SPACE":
      return <ConfinedSpacePermitForm {...common} permit={{ ...existing, form: details as never }} />
    case "WORKING_ALOFT":
      return <WorkingAloftPermitForm {...common} permit={{ ...existing, form: details as never }} />
    default:
      notFound()
  }
}