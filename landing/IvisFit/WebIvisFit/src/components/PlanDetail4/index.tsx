import { PlanDetailPage } from "../PlanDetailPage";
import { getPlanById } from "../../data/plans";

export function PlanDetail4() {
  return <PlanDetailPage plan={getPlanById("semi-presencial")} />;
}
