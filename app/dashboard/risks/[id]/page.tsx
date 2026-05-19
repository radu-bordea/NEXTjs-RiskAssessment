import { getRiskById } from "@/app/actions/risk.actions";
import RiskView from "../../_components/RiskView";

export default async function RiskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const risk = await getRiskById(id);

  if (!risk) {
    return <div>Risk not found</div>;
  }

  return <RiskView risk={risk} />;
}