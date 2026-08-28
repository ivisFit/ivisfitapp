import { PlanDetailPage } from "../PlanDetailPage";
import { getPlanById } from "../../data/plans";

export function PlanDetail2() {
  return <PlanDetailPage plan={getPlanById("presencial")} />;
}
