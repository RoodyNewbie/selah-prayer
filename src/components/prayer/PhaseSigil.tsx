import { cn } from '@/lib/utils';

const phaseSigils = {
  praise: 'M12 3.5l1.4 3.2 3.5.3-2.6 2.3.8 3.4L12 11.1l-3.1 1.6.8-3.4L7.1 7l3.5-.3L12 3.5z',
  will: 'M5 12c2.4-3.8 5.2-5.7 7-5.7s4.6 1.9 7 5.7c-2.4 3.8-5.2 5.7-7 5.7S7.4 15.8 5 12zm7-2.7a2.7 2.7 0 100 5.4 2.7 2.7 0 000-5.4z',
  needs: 'M12 4.5c3.2 0 5.8 2.5 5.8 5.6 0 3.9-3.4 6.5-5.8 9-2.4-2.5-5.8-5.1-5.8-9 0-3.1 2.6-5.6 5.8-5.6z',
  forgiveness: 'M12 4.2l5.8 3.1v5.4c0 3.7-2.5 6.2-5.8 7.1-3.3-.9-5.8-3.4-5.8-7.1V7.3L12 4.2zm-2 7.6l1.5 1.6 2.8-3',
  protection: 'M12 3.8l6.4 4.1-2.1 8.1H7.7L5.6 7.9 12 3.8zm0 3.2l-2.4 1.5.8 3.4h3.2l.8-3.4L12 7z',
  worship: 'M12 4.5c2.2 0 4.1 1.9 4.1 4.2 0 1.8-1 3.2-2.4 4.5L12 19.2l-1.7-6c-1.4-1.3-2.4-2.7-2.4-4.5 0-2.3 1.9-4.2 4.1-4.2z',
} as const;

type PhaseId = keyof typeof phaseSigils;

interface PhaseSigilProps {
  phaseId: PhaseId;
  className?: string;
  strokeClassName?: string;
}

export function PhaseSigil({ phaseId, className, strokeClassName }: PhaseSigilProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      className={cn('w-5 h-5', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={phaseSigils[phaseId]} className={strokeClassName} />
    </svg>
  );
}

export type { PhaseId };
