import * as React from "react";
import { cn } from "./utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, ...props }, ref) => (
    <input
      type="range"
      ref={ref}
      min={min}
      max={max}
      step={step}
      className={cn(
        "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-orange-500",
        className
      )}
      {...props}
    />
  )
);
Slider.displayName = "Slider";

export { Slider };
