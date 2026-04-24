import { cn } from '@/lib/utils';

interface SectionRuleProps {
  className?: string;
}

export function SectionRule({ className }: SectionRuleProps) {
  return <div aria-hidden="true" className={cn('section-rule', className)} />;
}
