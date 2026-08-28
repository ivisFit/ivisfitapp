import { redirect } from "next/navigation";
import { profeAlumnaSeguimientoRoute } from "@/routes/paths";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(profeAlumnaSeguimientoRoute(id));
}
