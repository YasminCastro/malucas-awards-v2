"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";

type VotingStatus = 
  | "escolhendo-categorias"
  | "pre-votacao"
  | "votacao"
  | "pos-votacao"
  | "resultado";

const statusOptions: { value: VotingStatus; label: string }[] = [
  { value: "escolhendo-categorias", label: "Escolhendo Categorias" },
  { value: "pre-votacao", label: "Pré-votação" },
  { value: "votacao", label: "Votação" },
  { value: "pos-votacao", label: "Pós Votação" },
  { value: "resultado", label: "Resultado" },
];

export default function AdminConfigPage() {
  const router = useRouter();
  const [status, setStatus] = useState<VotingStatus>("escolhendo-categorias");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.status === 401 || response.status === 403) {
        router.push("/");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          setStatus(data.status);
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar configurações");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-4xl mx-auto">
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
                  Configurações
                </h1>
                <p className="text-black text-sm mt-1">
                  Gerencie as configurações do sistema
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
                className="h-12 px-6"
              >
                Voltar
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="border-4 border-black">
            <CardContent className="p-6">
              <p className="text-center">Carregando...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-4 border-black">
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Configure o status atual do processo de votação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VotingStatus)}
                  className="w-full px-3 py-2 border-2 border-black rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f93fff] focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border-2 border-red-500 rounded-md text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-100 border-2 border-green-500 rounded-md text-green-700">
                  Configurações salvas com sucesso!
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
