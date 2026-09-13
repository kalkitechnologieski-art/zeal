import { redirect } from "next/navigation";

/**
 * /admin fallback redirect.
 *
 * If a separate admin app is deployed, this redirects there.
 * Otherwise, redirects to the dashboard with an admin prompt.
 */
export default function AdminRedirect() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  // If admin URL is set and points to a DIFFERENT domain, redirect there
  if (adminUrl && !adminUrl.includes("zeal-web.vercel.app")) {
    redirect(adminUrl);
  }

  // Otherwise, redirect to login with a note
  redirect("/auth/login?redirect=/dashboard&admin=true");
}
