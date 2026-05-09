import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ContentSectionProps {
  children: ReactNode;
  className?: string;
  prayerWidth?: boolean;
}

export function ContentSection({ children, className, prayerWidth = false }: ContentSectionProps) {
  return (
    <section className={cn('content-shell', prayerWidth && 'content-shell-prayer', className)}>
      {children}
    </section>
  );
}
