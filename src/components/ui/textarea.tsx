import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  const generatedId = React.useId();
  const resolvedId = props.id ?? generatedId;
  const needsAriaLabel =
    props["aria-label"] == null &&
    props["aria-labelledby"] == null &&
    props.id == null;
  const resolvedAriaLabel = needsAriaLabel
    ? (typeof props.placeholder === "string" && props.placeholder.trim()
        ? props.placeholder
        : props.name || "Text field")
    : props["aria-label"];

  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
      id={resolvedId}
      aria-label={resolvedAriaLabel}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
