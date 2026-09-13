import { redirect } from "next/navigation";

/**
 * /admin/login fallback.
 * Redirects to main login page.
 */
export default function AdminLoginRedirect() {
  redirect("/auth/login?admin=true");
}
