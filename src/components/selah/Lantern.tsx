import { SVGProps } from "react";

export const Lantern = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 48 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <defs>
      <radialGradient id="flame" cx="50%" cy="55%" r="50%">
        <stop offset="0%" stopColor="hsl(48 100% 88%)" />
        <stop offset="55%" stopColor="hsl(38 95% 65%)" />
        <stop offset="100%" stopColor="hsl(20 80% 40% / 0)" />
      </radialGradient>
      <linearGradient id="frame" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="hsl(38 50% 70%)" />
        <stop offset="100%" stopColor="hsl(28 35% 35%)" />
      </linearGradient>
    </defs>
    <path d="M24 2 v6" stroke="url(#frame)" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="24" cy="2" r="1.4" fill="url(#frame)" />
    <path d="M14 10 h20 l-3 4 H17 z" fill="url(#frame)" />
    <rect x="13" y="14" width="22" height="32" rx="3" fill="hsl(38 60% 20% / 0.35)" stroke="url(#frame)" strokeWidth="1.2" />
    <ellipse cx="24" cy="32" rx="6" ry="9" fill="url(#flame)" className="flicker" style={{ transformOrigin: "24px 36px" }} />
    <circle cx="24" cy="34" r="2.2" fill="hsl(48 100% 92%)" />
    <path d="M11 46 h26 l-3 5 H14 z" fill="url(#frame)" />
    <rect x="16" y="51" width="16" height="3" rx="1" fill="url(#frame)" />
  </svg>
);
