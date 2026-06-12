"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Plus,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

export function AppNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="pt-safe flex w-full flex-col gap-2 border-b bg-background p-4 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <Link href="/dashboard" className="mb-4 flex items-center gap-2 font-bold">
        <ShieldCheck className="size-6 text-primary" />
        CarGuard <span className="text-accent">AI</span>
      </Link>

      <Button asChild className="mb-2 w-full justify-start gap-2">
        <Link href="/inspections/new">
          <Plus className="size-4" /> New inspection
        </Link>
      </Button>

      <nav className="flex flex-row gap-1 md:flex-col">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <ShieldCheck className="size-4" />
            <span className="hidden md:inline">Admin</span>
          </Link>
        )}
      </nav>

      <Button
        variant="ghost"
        className="mt-auto justify-start gap-2 text-muted-foreground"
        onClick={signOut}
      >
        <LogOut className="size-4" />
        <span className="hidden md:inline">Sign out</span>
      </Button>
    </aside>
  );
}
