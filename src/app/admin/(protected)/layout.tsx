import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import type { SessionData } from "@/types";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.uid) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <nav className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="font-bold text-gray-900 hover:text-indigo-600">
              管理ダッシュボード
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
