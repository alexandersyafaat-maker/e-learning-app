import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchNilaiSiswa } from "@/features/nilai/services/nilai.service";
import { NilaiSiswaTable } from "@/features/nilai/components/NilaiSiswaTable";
import { NilaiPrintView } from "@/features/nilai/components/NilaiPrintView";

export const metadata: Metadata = { title: "Nilai Saya" };

export default async function SiswaNilaiPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await fetchNilaiSiswa(session.userId).catch(() => ({
    latihan: [],
    tugas: [],
  }));

  return (
    <>
      <NilaiSiswaTable data={data} namaSiswa={session.name} />
      <NilaiPrintView data={data} namaSiswa={session.name} />
    </>
  );
}
