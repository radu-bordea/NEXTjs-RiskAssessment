import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import HotWorkPermitForm from "../../_components/HotWorkPermitForm"

/**
 * NewHotWorkPermitPage — Create a new Hot Work Permit
 *
 * Location: app/workpermitsdashboard/new/hot-work/page.tsx
 * Server component: gets the logged-in user and passes their name
 * to the form as the VESSEL (read-only — each vessel logs in with its own account).
 * Use the same redirect path as your Observation "new" page.
 */
export default async function NewHotWorkPermitPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <HotWorkPermitForm vessel={user.name ?? user.email} />
    </div>
  )
}