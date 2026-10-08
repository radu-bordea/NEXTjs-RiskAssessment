import ConfinedSpacePermitForm from "../../_components/ConfinedSpacePermitForm"

/**
 * NewConfinedSpacePermitPage — Create a new Confined Space Entry Permit
 *
 * Location: app/workpermitsdashboard/new/confined-space/page.tsx
 * UI only for now. Add the same auth / role check as your
 * Observation "new" page when the DB is connected.
 */
export default function NewConfinedSpacePermitPage() {
  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <ConfinedSpacePermitForm />
    </div>
  )
}