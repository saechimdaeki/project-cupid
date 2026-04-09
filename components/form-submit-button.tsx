"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type FormSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
};

export function FormSubmitButton({ idleLabel, pendingLabel, className }: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={cn("h-12 rounded-full px-5 text-sm font-semibold", className)}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
