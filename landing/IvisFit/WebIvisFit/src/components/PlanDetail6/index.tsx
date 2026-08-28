import { PlanDetailPage } from "../PlanDetailPage";
import { getPlanById } from "../../data/plans";

export function PlanDetail6() {
  return <PlanDetailPage plan={getPlanById("mami-fit")} />;
}
