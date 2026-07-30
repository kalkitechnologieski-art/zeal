import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
export default async function AdminHome() {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  redirect("/dashboard");
}
