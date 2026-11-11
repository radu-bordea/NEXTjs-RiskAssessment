import { notFound } from "next/navigation";
import { getRiskById } from "@/app/actions/risk.actions";
import RiskView from "../../_components/RiskView";

/**
 * RiskPage — read-only view of one risk
 *
 * getRiskById returns null when the risk doesn't exist OR when a MEMBER
 * tries to open another vessel's risk → both show "not found".
 */
export default async function RiskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const risk = await getRiskById(id);

  if (!risk) notFound();

  return <RiskView risk={risk} />;
}