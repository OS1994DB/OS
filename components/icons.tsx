type IconProps = { className?: string };

export function DashboardIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
      <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
      <rect x="3.5" y="13" width="7" height="7.5" rx="1.5" />
    </svg>
  );
}

export function ResidentsIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  );
}

export function StaffIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <circle cx="12" cy="10" r="2" />
      <path d="M9 16c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5" />
    </svg>
  );
}

export function NoteIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
      <path d="M14 3v6h6" />
    </svg>
  );
}

export function CarePlanIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3v2h6V3" />
      <path d="M8 11h8M8 15h5" />
    </svg>
  );
}

export function SignOutIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M15 3h3a2 2 0 012 2v14a2 2 0 01-2 2h-3" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function AssessmentIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3v2h6V3" />
      <path d="m8.5 12.5 2 2 4-4" />
    </svg>
  );
}

export function ShieldAlertIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z" />
      <path d="M12 8v4" />
      <circle cx="12" cy="15.3" r=".2" fill="currentColor" />
    </svg>
  );
}

export function AlertTriangleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 4 3 19h18z" />
      <path d="M12 10.5v3.5" />
      <circle cx="12" cy="16.6" r=".2" fill="currentColor" />
    </svg>
  );
}

export function MedicalCrossIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v3.5M16 3v3.5" />
    </svg>
  );
}

export function FolderIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h4l2 2h7A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" />
    </svg>
  );
}

export function WalletIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16" cy="14" r="1.3" />
    </svg>
  );
}

export function PencilIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19 3 20l1-4z" />
    </svg>
  );
}

export function PillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4.5" y="9.5" width="15" height="7" rx="3.5" transform="rotate(-45 12 13)" />
      <path d="m9.5 9.5 5 5" />
    </svg>
  );
}

export function HeartIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 20s-7-4.4-9.3-8.8C1.3 8 2.8 5 6 5c1.9 0 3.3 1 4 2.3C10.7 6 12.1 5 14 5c3.2 0 4.7 3 3.3 6.2C15 15.6 12 20 12 20z" />
    </svg>
  );
}

export function WalkIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="13" cy="4" r="1.6" />
      <path d="M10 8.5 13 7l2.5 2.5L18 11M13 7l-1 5-3.5 2.5M12 12l1.5 2L12 19M9.5 14.5 7 16l-1 3" />
    </svg>
  );
}

export function DropletIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3s6 7 6 11.5a6 6 0 0 1-12 0C6 10 12 3 12 3z" />
    </svg>
  );
}

export function ShirtIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M8 4 4 7l2 3 2-1.3V20h8V8.7L18 10l2-3-4-3-2 2h-4z" />
    </svg>
  );
}

export function ToothIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 4c-3 0-5 1.8-5 5 0 3 1 4 1.3 8 .1 1.5 2.2 1.6 2.5.3L12 13l1.2 4.3c.3 1.3 2.4 1.2 2.5-.3.3-4 1.3-5 1.3-8 0-3.2-2-5-5-5z" />
    </svg>
  );
}

export function HandIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V13M17 9a1.5 1.5 0 0 1 3 0v6c0 3-2 6-6 6h-1c-3 0-4.5-1-6-3l-2.5-4c-.6-1 .3-2.2 1.4-1.8L8 13" />
    </svg>
  );
}

export function SpeechBubbleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </svg>
  );
}

export function EyeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function LungsIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 4v7" />
      <path d="M12 11c0-1.5-1.2-2-2.5-2S7 10 7 12.5v4c0 1.9-1 2.5-2 2.5-1.3 0-2-1-2-2.5v-5" />
      <path d="M12 11c0-1.5 1.2-2 2.5-2S17 10 17 12.5v4c0 1.9 1 2.5 2 2.5 1.3 0 2-1 2-2.5v-5" />
    </svg>
  );
}

export function AppleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 9c-3.5-3-8-1-8 4s3 8 6 8c1 0 1.3-.5 2-.5s1 .5 2 .5c2.6 0 6-3.5 6-7.5 0-3.5-2.8-5-5-4" />
      <path d="M12 9V6.5c0-1.2.8-2 2-2.3" />
    </svg>
  );
}

export function CupIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M5 4h11v9a5.5 5.5 0 0 1-11 0z" />
      <path d="M16 7h1.5a2.5 2.5 0 0 1 0 5H16" />
    </svg>
  );
}

export function MoonIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M19 14.5A8 8 0 1 1 10 4a6.5 6.5 0 0 0 9 10.5z" />
    </svg>
  );
}

export function BrainIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M9 4.5a2.5 2.5 0 0 0-2.5 2.5v.3A3 3 0 0 0 5 10v1a3 3 0 0 0 1.5 2.6V15a3 3 0 0 0 3 3h.5" />
      <path d="M15 4.5a2.5 2.5 0 0 1 2.5 2.5v.3A3 3 0 0 1 19 10v1a3 3 0 0 1-1.5 2.6V15a3 3 0 0 1-3 3h-.5" />
      <path d="M9.5 4.6V18M14.5 4.6V18" />
    </svg>
  );
}

export function PeopleGroupIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="8.5" cy="8" r="2.3" />
      <circle cx="16" cy="9" r="2" />
      <path d="M3.5 18.5c0-2.8 2.3-4.8 5-4.8s5 2 5 4.8" />
      <path d="M13.3 14.5c2.2.3 3.7 1.9 3.7 4" />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function BoxIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3.5 7.5 12 3l8.5 4.5L12 12 3.5 7.5z" />
      <path d="M3.5 7.5V16L12 20.5M20.5 7.5V16L12 20.5M12 12v8.5" />
    </svg>
  );
}

export function BuildingIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 21V5l8-2 8 2v16" />
      <path d="M9 21v-4h6v4M8 9h2M14 9h2M8 13h2M14 13h2" />
    </svg>
  );
}
