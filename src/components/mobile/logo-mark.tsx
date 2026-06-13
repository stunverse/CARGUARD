import Link from "next/link";
import { cn } from "@/lib/utils";

// CarGuard AI wordmark + shield icon. Uses /public/icon.svg as the mark.
export function LogoMark({
  className,
  size = 28,
  href = "/dashboard",
}: {
  className?: string;
  size?: number;
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 font-extrabold tracking-tight", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" aria-hidden width={size} height={size} />
      <span className="text-xl">
        <span className="text-[#E50914]">CarGuard</span>{" "}
        <span className="text-[#9AA3AF]">AI</span>
      </span>
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} aria-label="CarGuard AI home">
      {content}
    </Link>
  );
}
