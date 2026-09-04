import "server-only";

import { cache } from "react";
import { fetchLandingPlans as fetchLandingPlansUncached } from "@/features/landing/lib/landing-plans-api";

export const fetchLandingPlans = cache(fetchLandingPlansUncached);
