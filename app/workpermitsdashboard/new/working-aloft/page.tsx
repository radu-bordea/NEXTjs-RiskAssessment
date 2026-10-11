import WorkingAloftPermitForm from "../../_components/WorkingAloftPermitForm"

/**
 * NewWorkingAloftPermitPage — Create a new Working Aloft / Overside Permit
 *
 * Location: app/workpermitsdashboard/new/working-aloft/page.tsx
 * UI only for now. Add the same auth / role check as your
 * Observation "new" page when the DB is connected.
 */
export default function NewWorkingAloftPermitPage() {
  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <WorkingAloftPermitForm />
    </div>
  )
}