import { PlanTemplateDetailPage } from "@/features/profe/pages/PlanTemplateDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlanTemplateDetailPage planId={id} />;
}
