import { cn } from "@/lib/utils";

/** AbroadMates wordmark. */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn(
          "text-[0.6rem] font-semibold uppercase tracking-[0.35em]",
          light ? "text-white/80" : "text-brand-600"
        )}
      >
        abroad
      </span>
      <span
        className={cn(
          "text-2xl font-extrabold tracking-tight",
          light ? "text-white" : "text-brand-600"
        )}
      >
        MATES
      </span>
    </span>
  );
}
