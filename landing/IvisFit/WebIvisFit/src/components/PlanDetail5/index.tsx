import { PlanDetailPage } from "../PlanDetailPage";
import { getPlanById } from "../../data/plans";

export function PlanDetail5() {
  return <PlanDetailPage plan={getPlanById("abs-power")} />;
}
