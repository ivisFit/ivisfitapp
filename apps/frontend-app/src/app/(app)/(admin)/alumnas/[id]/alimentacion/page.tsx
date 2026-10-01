import { redirect } from "next/navigation";
import { profeAlumnaAlimentacionStepRoute } from "@/routes/paths";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(profeAlumnaAlimentacionStepRoute(id, "perfil"));
}
