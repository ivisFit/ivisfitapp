import { redirect } from "next/navigation";
import { profeRoutes } from "@/routes/paths";

export default function Page() {
  redirect(profeRoutes.panel);
}
