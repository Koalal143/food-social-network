import { cn } from "@/lib/utils";

export default function Container({ children, className }) {
  return (
    <div className={cn("mx-auto px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl", className)}>
      {children}
    </div>
  );
}