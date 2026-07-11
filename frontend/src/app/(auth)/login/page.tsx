import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { fetchKelasList } from "@/features/kelas/services/kelas.service";
import { fetchKelasList as fetchKelasListDummy } from "@/features/kelas/services/kelas.dummy";

export const metadata: Metadata = {
  title: "Login — E-Learning App",
};

export default async function LoginPage() {
  // Fallback to dummy if backend down — login page must always render
  const kelasList = await fetchKelasList().catch(() => fetchKelasListDummy());

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <span className="text-white text-xl font-bold">E</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">E-Learning App</h1>
          <p className="text-sm text-slate-500 mt-1">Platform belajar bahasa Inggris</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <AuthCard kelasList={kelasList} />
        </div>

        <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Akun Demo (semua password: <code>password123</code>):</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p><span className="font-medium">Admin:</span> admin@elearning.id</p>
            <p><span className="font-medium">Guru:</span> budi.guru@elearning.id</p>
            <p><span className="font-medium">Siswa:</span> andi.siswa@elearning.id</p>
          </div>
        </div>
      </div>
    </div>
  );
}
