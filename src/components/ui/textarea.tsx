import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-lg bg-card px-4 py-3 text-base text-foreground input-polished placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-body resize-none leading-relaxed",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
