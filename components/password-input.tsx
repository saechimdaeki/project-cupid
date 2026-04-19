"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PasswordInputProps = ComponentProps<"input">;

export function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        className={cn("pr-12", className)}
        disabled={disabled}
        type={isVisible ? "text" : "password"}
        {...props}
      />
      <Button
        aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
        className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 rounded-lg text-muted-foreground hover:text-foreground"
        disabled={disabled}
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}
