import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  const ADMIN_NAV = [
    { href: "/admin", label: t(locale, "adm.nav.overview") },
    { href: "/admin/users", label: t(locale, "adm.nav.users") },
    { href: "/admin/inspections", label: t(locale, "adm.nav.inspections") },
    { href: "/admin/reports", label: t(locale, "adm.nav.reports") },
    { href: "/admin/vehicle-knowledge", label: t(locale, "adm.nav.modelKnowledge") },
    { href: "/admin/photo-points", label: t(locale, "adm.nav.photoPoints") },
    { href: "/admin/billing", label: t(locale, "adm.nav.billing") },
    { href: "/admin/support", label: t(locale, "adm.nav.support") },
  ];
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
    <div className="px-5 py-6">
      <h1 className="mb-4 text-2xl font-bold">{t(locale, "adm.title")}</h1>
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
