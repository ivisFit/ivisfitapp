import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/lib/preview-cms/**/*.{ts,tsx}",
    "./src/features/landing/cms/**/*.{ts,tsx}",
    "./src/features/profe/pages/PlanesLandingAdmin.tsx",
    "./src/app/(preview)/cms-preview/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
