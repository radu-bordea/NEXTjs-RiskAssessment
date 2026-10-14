import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ConfinedSpacePermitForm from "../../_components/ConfinedSpacePermitForm"

/**
 * NewConfinedSpacePermitPage — Create a new Confined Space Entry Permit
 *
 * Location: app/workpermitsdashboard/new/confined-space/page.tsx
 * Server component: gets the logged-in user and passes their name
 * to the form as the VESSEL (read-only — each vessel logs in with its own account).
 * Use the same redirect path as your Observation "new" page.
 */
export default async function NewConfinedSpacePermitPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <ConfinedSpacePermitForm vessel={user.name ?? user.email} />
    </div>
  )
}