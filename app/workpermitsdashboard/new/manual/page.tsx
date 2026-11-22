import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ManualWorkPermitForm from "../../_components/ManualWorkPermitForm"

/**
 * NewManualWorkPermitPage — upload an existing permit as PDF
 *
 * Location: app/workpermitsdashboard/new/manual/page.tsx
 * All roles can upload. Vessel = the logged-in user (shown read-only;
 * the server sets it again when saving).
 */
export default async function NewManualWorkPermitPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <ManualWorkPermitForm vessel={user.name ?? user.email} />
    </div>
  )
}