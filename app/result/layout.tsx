import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth";

export default async function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}
