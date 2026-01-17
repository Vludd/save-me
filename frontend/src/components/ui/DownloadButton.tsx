import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { DownloadIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/buttonVariants";

interface DownloadButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  progress?: number;
  state?: "default" | "loading" | "success" | "error";
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  asChild = false,
  className,
  variant,
  size,
  progress,
  state = "default",
  children,
  ...props
}) => {
  const Comp = asChild ? Slot : "button";

  const isLoading = state === "loading" || progress != null;
  const isSuccess = state === "success";
  const isError = state === "error";

  const stateClasses = cn(
    "relative overflow-hidden flex items-center justify-center hover:cursor-pointer rounded-lg px-4 py-2 transition-colors",
    isLoading && "bg-gray-700 dark:bg-gray-800 text-white cursor-wait",
    isSuccess && "bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700",
    isError && "bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700",
    !isLoading && !isSuccess && !isError && "bg-primary/90 text-white hover:bg-primary/80 dark:bg-primary/10 dark:hover:bg-primary/20 transition"
  );

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), stateClasses)}
      {...props}
    >
      {progress != null && (
        <span
          className="absolute left-0 top-0 h-full bg-linear-to-r from-green-400 to-blue-500 opacity-100 z-0 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      )}

      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <Spinner className="w-4 h-4" />
        ) : !isSuccess && !isError ? (
          <DownloadIcon className="w-4 h-4" />
        ) : null}
        {progress != null
          ? `${progress}%`
          : isLoading
          ? "Preparing..."
          : isSuccess
          ? "Done"
          : isError
          ? "Error"
          : children}
      </span>
    </Comp>
  );
};
