import * as React from "react";
import { cn } from "./utils";

interface DropdownMenuProps {
  children: React.ReactNode;
}

function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className="relative inline-block">{children}</div>;
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
));
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute right-0 mt-2 w-56 rounded-md border border-slate-200 bg-white p-1 shadow-md z-50",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-slate-100", className)} {...props} />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
