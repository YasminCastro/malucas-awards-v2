"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
              >
                Voltar
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Admin Options */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-4 border-black hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Crie, edite e gerencie usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/users")}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-4 border-black hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Gerenciamento de Categorias</CardTitle>
              <CardDescription>
                Crie, edite e gerencie categorias de premiação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/categories")}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-4 border-black hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription>
                Visualize resultados e votos dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/result")}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
