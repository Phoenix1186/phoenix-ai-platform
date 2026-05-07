import * as React from "react";
import { cn } from "./utils";

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  fallback?: string;
  alt?: string;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, fallback, alt, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || fallback || "Avatar"} className="aspect-square h-full w-full" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-orange-100 text-orange-600 font-medium">
          {fallback?.charAt(0).toUpperCase() || "U"}
        </span>
      )}
    </span>
  )
);
Avatar.displayName = "Avatar";

export { Avatar };
