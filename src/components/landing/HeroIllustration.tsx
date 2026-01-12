import { cn } from '@/lib/utils';

interface HeroIllustrationProps {
  className?: string;
}

export function HeroIllustration({ className }: HeroIllustrationProps) {
  return (
    <div className={cn('relative w-full max-w-md mx-auto', className)}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-hidden="true"
      >
        {/* Background glow */}
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Center glow */}
        <ellipse cx="200" cy="150" rx="150" ry="120" fill="url(#centerGlow)" />

        {/* Concentric circles - representing peace/wholeness */}
        <circle
          cx="200"
          cy="150"
          r="100"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeOpacity="0.15"
          fill="none"
          className="animate-[gentlePulse_4s_ease-in-out_infinite]"
        />
        <circle
          cx="200"
          cy="150"
          r="70"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          fill="none"
          className="animate-[gentlePulse_4s_ease-in-out_0.5s_infinite]"
        />
        <circle
          cx="200"
          cy="150"
          r="40"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeOpacity="0.35"
          fill="url(#circleGradient)"
          className="animate-[gentlePulse_4s_ease-in-out_1s_infinite]"
        />

        {/* Flowing curves - representing the Holy Spirit / peace */}
        <path
          d="M50 180 Q125 120 200 150 T350 130"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M50 200 Q125 140 200 170 T350 150"
          stroke="url(#waveGradient)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
        <path
          d="M50 220 Q125 160 200 190 T350 170"
          stroke="url(#waveGradient)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />

        {/* Small dove silhouette in center */}
        <g transform="translate(185, 135) scale(0.6)" opacity="0.6">
          <path
            d="M25 15 C20 10 10 10 5 15 C10 12 15 12 20 15 C15 15 10 18 8 22 C12 20 18 18 25 15 Z"
            fill="hsl(var(--primary))"
          />
          <path
            d="M25 15 C30 10 40 10 45 15 C40 12 35 12 30 15 C35 15 40 18 42 22 C38 20 32 18 25 15 Z"
            fill="hsl(var(--primary))"
          />
          <ellipse cx="25" cy="18" rx="4" ry="6" fill="hsl(var(--primary))" />
        </g>

        {/* Subtle rays from center */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={angle}
            x1="200"
            y1="150"
            x2={200 + Math.cos((angle * Math.PI) / 180) * 120}
            y2={150 + Math.sin((angle * Math.PI) / 180) * 90}
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
            strokeOpacity={0.1 + (i % 2) * 0.05}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}
