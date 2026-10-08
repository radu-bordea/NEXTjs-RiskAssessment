import HotWorkPermitForm from "../../_components/HotWorkPermitForm";


/**
 * NewHotWorkPermitPage — Create a new Hot Work Permit
 *
 * Location: app/workpermitsdashboard/new/hot-work/page.tsx
 * UI only for now. Add the same auth / role check as your
 * Observation "new" page when the DB is connected.
 */
export default function NewHotWorkPermitPage() {
  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <HotWorkPermitForm/>
    </div>
  )
}