import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r p-4">
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100 rounded">Dashboard</Link>
          <Link href="/users" className="block px-4 py-2 hover:bg-gray-100 rounded">Users</Link>
          <Link href="/healers" className="block px-4 py-2 hover:bg-gray-100 rounded">Healers</Link>
          <Link href="/finance" className="block px-4 py-2 hover:bg-gray-100 rounded">Finance</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
