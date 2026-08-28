import { redirect } from "next/navigation";
import { profeAlumnaAlimentacionRoute } from "@/routes/paths";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(profeAlumnaAlimentacionRoute(id));
}
