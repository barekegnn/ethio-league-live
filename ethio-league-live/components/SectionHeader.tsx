import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader = ({ title, action, className }: SectionHeaderProps) => (
  <div className={cn("flex items-end justify-between mb-3", className)}>
    <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
      {title}
    </h2>
    {action}
  </div>
);
