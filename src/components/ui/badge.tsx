import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-muted text-muted-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border bg-card",
        /* 포레스트 에코 커스텀 팔레트 */
        forest: "border-transparent bg-[#1E3024] text-[#F4FBF4] font-bold shadow-xs",
        sage: "border-transparent bg-[#4D6E56] text-[#F4FBF4] font-bold shadow-xs",
        soft: "border border-[#516053]/30 bg-[#D6E1D8]/70 text-[#1E3024] font-bold dark:bg-[#273A2D] dark:text-[#F4FBF4]",
        cyan: "border-transparent bg-[#4D6E56] text-[#F4FBF4] font-bold shadow-xs",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.5 leading-none",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
