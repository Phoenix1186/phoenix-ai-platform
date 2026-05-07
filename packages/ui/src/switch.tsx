import * as React from "react";
import { cn } from "./utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
      <input type="checkbox" ref={ref} className="peer sr-only" {...props} />
      <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-orange-500 peer-checked:after:translate-x-4" />
    </label>
  )
);
Switch.displayName = "Switch";

export { Switch };
