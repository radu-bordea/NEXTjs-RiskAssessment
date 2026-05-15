import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import RiskTable from "./components/RiskTable";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const risks = await prisma.risk.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true, email: true } },
      stateUpdatedBy: { select: { name: true } },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return <RiskTable risks={risks} currentUser={user} />;
}
