import { LandingHomePage } from "@/features/landing/pages/LandingHomePage";
import { fetchLandingPlans } from "@/features/landing/lib/landing-plans-api";

export const revalidate = 300;

export default async function Page() {
  const plans = await fetchLandingPlans();
  return <LandingHomePage plans={plans} />;
}
