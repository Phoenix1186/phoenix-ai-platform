import * as React from "react";
import { cn } from "./utils";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </SheetContext.Provider>
  );
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  const ctx = React.useContext(SheetContext);
  return (
    <button ref={ref} onClick={() => ctx?.onOpenChange(true)} {...props}>
      {children}
    </button>
  );
});
SheetTrigger.displayName = "SheetTrigger";

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" }
>(({ className, side = "right", children, ...props }, ref) => {
  const ctx = React.useContext(SheetContext);
  if (!ctx?.open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => ctx.onOpenChange(false)}
      />
      <div
        ref={ref}
        className={cn(
          "fixed z-50 h-full bg-white p-6 shadow-lg transition ease-in-out",
          side === "left" ? "inset-y-0 left-0 w-3/4 sm:max-w-sm" : "inset-y-0 right-0 w-3/4 sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
});
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetContent };
