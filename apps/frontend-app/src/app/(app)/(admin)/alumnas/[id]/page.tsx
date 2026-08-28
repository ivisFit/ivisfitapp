import { AlumnaDetailPage } from "@/features/profe/pages/AlumnaDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AlumnaDetailPage alumnaId={id} />;
}
