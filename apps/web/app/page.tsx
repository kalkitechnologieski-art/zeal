import { redirect } from "next/navigation";

/**
 * Homepage – redirects to /dashboard.
 * Server-side redirect avoids the flash and works without JS.
 */
export default function HomePage() {
  redirect("/dashboard");
}
