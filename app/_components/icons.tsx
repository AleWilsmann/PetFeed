import type { SVGProps } from "react";

type IconName =
  | "paw"
  | "home"
  | "bowl"
  | "clock"
  | "user"
  | "plus"
  | "check"
  | "arrow"
  | "wifi"
  | "tag"
  | "mail"
  | "lock"
  | "food"
  | "device";

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  const shared = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    ...props,
  };

  const paths: Record<IconName, React.ReactNode> = {
    paw: (
      <>
        <ellipse cx="12" cy="15.5" rx="4.3" ry="3.3" />
        <ellipse cx="5.6" cy="10" rx="1.8" ry="2.3" />
        <ellipse cx="10" cy="6.8" rx="1.8" ry="2.3" />
        <ellipse cx="16" cy="6.8" rx="1.8" ry="2.3" />
        <ellipse cx="20.4" cy="10" rx="1.8" ry="2.3" />
      </>
    ),
    home: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M9 14V9h6v5M11 11h2" />
      </>
    ),
    bowl: (
      <>
        <path d="M4 12h16l-1.6 5.2a2.5 2.5 0 0 1-2.4 1.8H8a2.5 2.5 0 0 1-2.4-1.8L4 12Z" />
        <path d="M8 12a4 4 0 0 1 8 0" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    wifi: (
      <>
        <path d="M4 9a12 12 0 0 1 16 0M7 12a7.5 7.5 0 0 1 10 0m-7 3a3 3 0 0 1 4 0" />
        <circle cx="12" cy="18" r=".7" fill="currentColor" />
      </>
    ),
    tag: (
      <>
        <path d="M4 7v10m4-13v16m4-13v10m4-13v16m4-13v10" />
      </>
    ),
    mail: (
      <>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="m5 7 7 5 7-5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2.5" />
        <path d="M8 10V7a4 4 0 1 1 8 0v3" />
      </>
    ),
    food: (
      <>
        <path d="M5 14h14l-1.4 4.2a2.5 2.5 0 0 1-2.4 1.8H8.8a2.5 2.5 0 0 1-2.4-1.8L5 14Z" />
        <path d="m8 10 2-2m4 2 2-2m-6 5 2-2m4 2 2-2" />
      </>
    ),
    device: (
      <>
        <rect x="6" y="3" width="12" height="18" rx="5" />
        <rect x="8" y="6" width="8" height="4" rx="2" />
        <circle cx="12" cy="15" r="1" fill="currentColor" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      {...shared}
    >
      {paths[name]}
    </svg>
  );
}
