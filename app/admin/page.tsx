"use client";

import { Button } from "@/components/ui/button";

import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import { AdminCard } from "@/components/admin-card";

export default function AdminPage() {

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-4 border-black rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Malucas Awards Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black uppercase tracking-tight">
                  Painel Administrativo
                </h1>
                <p className="text-black text-sm mt-1">
                  Central de gerenciamento
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="h-12 px-6"
              >
                Voltar
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AdminCard title="Gerenciamento de Usuários" description="Crie, edite e gerencie usuários do sistema" path="/admin/users" />
          <AdminCard title="Gerenciamento de Categorias" description="Crie, edite e gerencie categorias de premiação" path="/admin/categories" />
          <AdminCard title="Sugestões de Categorias" description="Gerencie as sugestões de categorias enviadas pelos usuários" path="/admin/category-suggestions" />
          <AdminCard title="Resultados" description="Visualize resultados e votos dos usuários" path="/admin/result" />
          <AdminCard title="Configurações" description="Configure o status e outras opções do sistema" path="/admin/config" />
        </div>
      </div>
    </div>
  );
}
