import { cn } from '@/lib/utils';

export const SIGIL_PATHS: Record<string, string> = {
  praise: 'M12 7 L13.8 11.2 L18 12 L13.8 12.8 L12 17 L10.2 12.8 L6 12 L10.2 11.2 Z',
  will: 'M12 4c-4 4-5 8-5 10a5 5 0 0010 0c0-2-1-6-5-10z',
  needs: 'M5 9h14 M7 9l1.5 9h7L17 9',
  forgiveness: 'M12 3l5 9a5 5 0 01-10 0z',
  protection: 'M12 3l9 3.5V12c0 5.5-4 9-9 10-5-1-9-4.5-9-10V6.5z',
  worship: 'M12 3c-4 4-4 9-4 10a4 4 0 008 0c0-1 0-6-4-10z',
};

export function isKnownSigil(phaseId: string): boolean {
  return Object.prototype.hasOwnProperty.call(SIGIL_PATHS, phaseId);
}

interface SigilProps {
  phase: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

export function Sigil({
  phase,
  size = 16,
  strokeWidth = 1.75,
  className,
  ariaLabel,
}: SigilProps) {
  const d = SIGIL_PATHS[phase];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn(className)}
    >
      <path d={d} />
    </svg>
  );
}
