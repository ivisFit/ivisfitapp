import Image from "next/image";
import iconIvis from "@/iconIvis.png";

type AppBrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function AppBrandLogo({ className = "", priority = false }: AppBrandLogoProps) {
  return (
    <Image
      src={iconIvis}
      alt="IVIS Fit"
      className={className}
      width={172}
      height={48}
      priority={priority}
    />
  );
}
