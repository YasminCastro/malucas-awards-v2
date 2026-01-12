import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { LogoutButton } from '@/components/logout-button';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFE066] p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white border-4 border-black rounded-lg p-8 space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-bold text-black uppercase tracking-tight">
              MALUCAS AWARDS 2026
            </h1>
            <p className="text-black text-lg font-medium">
              Bem-vindo, <span className="font-bold">@{user.instagram}</span>!
            </p>
          </div>
          
          <div className="border-t-2 border-black pt-6">
            <p className="text-black text-center mb-6 font-medium">
              Sistema de autenticação configurado com sucesso! 🎉
            </p>
            <div className="flex justify-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
