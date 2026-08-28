import type { ReactElement, ReactNode } from "react";
import type { NavIconId } from "@/config/navigation";

interface NavIconProps {
  size?: number;
  className?: string;
}

function NavIconSvg({
  size = 24,
  className,
  children,
}: NavIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function HomeIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5Z" />
      <path d="M9 22V12h6v10" />
    </NavIconSvg>
  );
}

function RoutineIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M6.5 6.5h11v11h-11z" />
      <path d="M9.5 9.5v5M14.5 9.5v5" />
      <circle cx="7" cy="12" r="1.5" />
      <circle cx="17" cy="12" r="1.5" />
      <path d="M5.5 12h3M15.5 12h3" />
    </NavIconSvg>
  );
}

function ProgressIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M3 18h18M3 18V6" />
      <path d="M7 14l4-4 4 2 4-6" />
      <circle cx="7" cy="14" r="1" />
      <circle cx="11" cy="10" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="19" cy="6" r="1" />
    </NavIconSvg>
  );
}

function NutritionIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M12 20c4 0 7-2.5 7-6.5S15 4 12 4 5 9.5 5 13.5 8 20 12 20Z" />
      <path d="M12 4v16" />
      <path d="M9.5 8.5c.5-1 1.5-1.5 2.5-1.5s2 .5 2.5 1.5" />
    </NavIconSvg>
  );
}

function SettingsIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </NavIconSvg>
  );
}

function PanelIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </NavIconSvg>
  );
}

function ExercisesIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M8 6h8M8 12h8M8 18h5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M16.5 16.5 14 14" />
    </NavIconSvg>
  );
}

function StudentsIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <circle cx="9" cy="7" r="3" />
      <circle cx="16" cy="7" r="3" />
      <path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M14 20c0-2.5 1.5-4 2.5-4s2.5 1.5 2.5 4" />
    </NavIconSvg>
  );
}

function NewRoutineIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M8 4h8v16H8V4Z" />
      <path d="M12 9v6M9 12h6" />
    </NavIconSvg>
  );
}

function AdmissionsIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <circle cx="9" cy="7" r="3" />
      <path d="M4 20c0-3 2.5-5 5-5s5 2 5 5" />
      <path d="M16 11v6M19 14h-6" />
    </NavIconSvg>
  );
}

function DumbbellIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M6.5 6.5h2v11h-2zM15.5 6.5h2v11h-2z" />
      <path d="M8.5 12h7" />
      <path d="M4.5 9.5v5M19.5 9.5v5" />
    </NavIconSvg>
  );
}

function FlaskIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M10 2h4" />
      <path d="M10 2v5l-4.5 9.5a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 7V2" />
      <path d="M8.5 14h7" />
    </NavIconSvg>
  );
}

function PlayIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m10 8 6 4-6 4V8Z" fill="currentColor" stroke="none" />
    </NavIconSvg>
  );
}

function LogoutIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </NavIconSvg>
  );
}

function MeasureIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M3 17l14-14 4 4L7 21H3v-4Z" />
      <path d="m14 4 2 2" />
      <path d="M6 18l2 2" />
    </NavIconSvg>
  );
}

function GlobeIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9Z" />
    </NavIconSvg>
  );
}

function ChatIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M5 6.5h14a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2H10l-4.5 3.5V8.5a2 2 0 0 1 2-2Z" />
      <path d="M8.5 11h7M8.5 14h4.5" />
    </NavIconSvg>
  );
}

function FoodCatalogIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M12 8c-3.5 0-6 3-6 7a5 5 0 0 0 5 5c1 0 1.3-.5 2-.5s1 .5 2 .5a5 5 0 0 0 5-5c0-3.3-1.8-5.9-4.5-6.8" />
      <path d="M12 8c0-1.5.5-3 2-4" />
      <path d="M9.5 4.5c1 0 2 .5 2.5 1.5" />
    </NavIconSvg>
  );
}

function TrophyIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
    </NavIconSvg>
  );
}

function CalendarIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <path d="M8 14h2M14 14h2M8 18h2" />
    </NavIconSvg>
  );
}

function UserIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </NavIconSvg>
  );
}

function LibraryIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M4 5h4v14H4zM10 5h4v14h-4zM16 7h4v12h-4z" />
    </NavIconSvg>
  );
}

function SparklesIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6.5 6.5 2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />
      <circle cx="12" cy="12" r="2.5" />
    </NavIconSvg>
  );
}

function MoreIcon(props: NavIconProps) {
  return (
    <NavIconSvg {...props}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </NavIconSvg>
  );
}

const navIconComponents: Record<
  NavIconId,
  (props: NavIconProps) => ReactElement
> = {
  home: HomeIcon,
  routine: RoutineIcon,
  progress: ProgressIcon,
  nutrition: NutritionIcon,
  settings: SettingsIcon,
  panel: PanelIcon,
  exercises: ExercisesIcon,
  students: StudentsIcon,
  newRoutine: NewRoutineIcon,
  admissions: AdmissionsIcon,
  dumbbell: DumbbellIcon,
  flask: FlaskIcon,
  play: PlayIcon,
  logout: LogoutIcon,
  measure: MeasureIcon,
  globe: GlobeIcon,
  chat: ChatIcon,
  foodCatalog: FoodCatalogIcon,
  trophy: TrophyIcon,
  calendar: CalendarIcon,
  user: UserIcon,
  library: LibraryIcon,
  sparkles: SparklesIcon,
  more: MoreIcon,
};

export function NavIcon({
  id,
  ...props
}: NavIconProps & { id: NavIconId }) {
  const Icon = navIconComponents[id];
  return <Icon {...props} />;
}
