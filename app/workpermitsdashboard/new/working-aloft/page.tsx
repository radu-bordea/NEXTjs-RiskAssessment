import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import WorkingAloftPermitForm from "../../_components/WorkingAloftPermitForm"

/**
 * NewWorkingAloftPermitPage — Create a new Working Aloft / Overside Permit
 *
 * Location: app/workpermitsdashboard/new/working-aloft/page.tsx
 * Server component: gets the logged-in user and passes their name
 * to the form as the VESSEL (read-only — each vessel logs in with its own account).
 * Use the same redirect path as your Observation "new" page.
 */
export default async function NewWorkingAloftPermitPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <WorkingAloftPermitForm vessel={user.name ?? user.email} />
    </div>
  )
}