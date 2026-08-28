import { PlanDetailPage } from "../PlanDetailPage";
import { getPlanById } from "../../data/plans";

export function PlanDetail3() {
  return <PlanDetailPage plan={getPlanById("gluteos")} />;
}
