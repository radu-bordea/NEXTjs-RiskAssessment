import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { riskVisibilityWhere } from "@/lib/riskAccess";
import RiskTable from "./_components/RiskTable";

/**
 * DashboardPage — Risk Assessment list
 *
 * ADMIN / MANAGER → all risks
 * MEMBER (vessel) → all templates + only their own drafts / completed risks
 */
export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // User first — the list depends on their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) redirect("/sign-in");

  const risks = await prisma.risk.findMany({
    where: riskVisibilityWhere(user),
    orderBy: [{ initiationDate: "desc" }, { createdAt: "desc" }],
    include: {
      createdBy: { select: { name: true, email: true } },
      stateUpdatedBy: { select: { name: true } },
      assessmentRows: true,
    },
  });

  return <RiskTable risks={risks as any} currentUser={user} />;
}