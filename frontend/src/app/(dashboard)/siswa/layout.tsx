import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Role } from "@/features/auth/types/auth.types";

export default async function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== Role.SISWA) redirect("/login");

  return <>{children}</>;
}
