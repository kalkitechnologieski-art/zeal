import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeClient } from "@/app/HomeClient";
export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return <HomeClient />;
}
