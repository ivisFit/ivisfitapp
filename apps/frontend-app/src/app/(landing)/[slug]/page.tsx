import { notFound } from "next/navigation";
import { PlanDetailPage } from "@/features/landing/components/PlanDetailPage";
import { fetchLandingPlanBySlug } from "@/features/landing/lib/landing-plans-api";
import { ApiError } from "@/lib/api";

export const revalidate = 300;

const RESERVED_SLUGS = new Set([
  "api",
  "panel",
  "login",
  "registro",
  "alumna",
  "alumnas",
  "ejercicios",
  "rutinas",
  "admisiones",
  "web-config",
  "cms-preview",
]);

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  try {
    const plan = await fetchLandingPlanBySlug(slug);
    return <PlanDetailPage plan={plan} slug={slug} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
