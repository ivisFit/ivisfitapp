import { fetchPanelDashboardServer } from "@/lib/panel-server";
import { DashboardProfe } from "@/features/profe/pages/DashboardProfe";

export default async function Page() {
  const initialData = await fetchPanelDashboardServer();

  return <DashboardProfe initialData={initialData} />;
}
