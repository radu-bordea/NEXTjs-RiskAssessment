import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ownRecordsWhere } from "@/lib/recordAccess";
import ObservationTable from "./_components/ObservationTable";

/**
 * ObservationDashboardPage — Observation Card dashboard
 *
 * ADMIN / MANAGER → all observations
 * MEMBER (vessel) → only the observations they created
 */
export default async function ObservationDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/sign-in");

  // Most recent first — filtered by role
  const observations = await prisma.observation.findMany({
    where: ownRecordsWhere(user),
    orderBy: { date: "desc" },
    select: {
      id: true,
      title: true,
      observationDescription: true,
      vesselProject: true,
      projectVoyage: true,
      date: true,
      state: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <ObservationTable observations={observations} currentUser={user} />
    </div>
  );
}