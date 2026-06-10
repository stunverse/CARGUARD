import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/inspections", label: "Inspections" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/vehicle-knowledge", label: "Model knowledge" },
  { href: "/admin/photo-points", label: "Photo points" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/support", label: "Support" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/dashboard");

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="mb-4 text-2xl font-bold">Admin</h1>
      <nav className="mb-6 flex flex-wrap gap-2 border-b pb-3 text-sm">
        {ADMIN_NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="rounded-md px-3 py-1.5 font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
