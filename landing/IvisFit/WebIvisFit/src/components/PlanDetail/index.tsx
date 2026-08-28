import { PlanDetailPage } from "../PlanDetailPage";
import { getPlanById } from "../../data/plans";

export function PlanDetail() {
  return <PlanDetailPage plan={getPlanById("online")} />;
}
