"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// ── Context ───────────────────────────────────────────────────────────────────

const ResponsiveModalContext = React.createContext<{ isMobile: boolean }>({ isMobile: false });

function useResponsiveModal() {
  return React.useContext(ResponsiveModalContext);
}

// ── Root ──────────────────────────────────────────────────────────────────────

type ResponsiveModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function ResponsiveModal({ open, onOpenChange, children }: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ResponsiveModalContext.Provider value={{ isMobile: true }}>
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      </ResponsiveModalContext.Provider>
    );
  }

  return (
    <ResponsiveModalContext.Provider value={{ isMobile: false }}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    </ResponsiveModalContext.Provider>
  );
}

// ── Content ───────────────────────────────────────────────────────────────────

type ResponsiveModalContentProps = {
  children: React.ReactNode;
  className?: string;
};

function ResponsiveModalContent({ children, className }: ResponsiveModalContentProps) {
  const { isMobile } = useResponsiveModal();

  if (isMobile) {
    return <DrawerContent className={className}>{children}</DrawerContent>;
  }

  return <DialogContent className={className}>{children}</DialogContent>;
}

// ── Header ────────────────────────────────────────────────────────────────────

function ResponsiveModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveModal();

  if (isMobile) {
    return <DrawerHeader className={className} {...props} />;
  }

  return <DialogHeader className={className} {...props} />;
}

// ── Title ─────────────────────────────────────────────────────────────────────

type ResponsiveModalTitleProps = {
  children: React.ReactNode;
  className?: string;
};

function ResponsiveModalTitle({ children, className }: ResponsiveModalTitleProps) {
  const { isMobile } = useResponsiveModal();

  if (isMobile) {
    return <DrawerTitle className={className}>{children}</DrawerTitle>;
  }

  return <DialogTitle className={className}>{children}</DialogTitle>;
}

// ── Description ───────────────────────────────────────────────────────────────

type ResponsiveModalDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

function ResponsiveModalDescription({ children, className }: ResponsiveModalDescriptionProps) {
  const { isMobile } = useResponsiveModal();

  if (isMobile) {
    return <DrawerDescription className={className}>{children}</DrawerDescription>;
  }

  return <DialogDescription className={className}>{children}</DialogDescription>;
}

// ── Footer ────────────────────────────────────────────────────────────────────

function ResponsiveModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveModal();

  if (isMobile) {
    return <DrawerFooter className={className} {...props} />;
  }

  return <DialogFooter className={className} {...props} />;
}

export {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
};
