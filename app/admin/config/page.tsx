"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminHeader } from "@/components/admin-header";
import { Spinner } from "@/components/ui/spinner";

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
  const [eventDate, setEventDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (data.eventDate) {
          setEventDate(data.eventDate);
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
      setError("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <AdminHeader title="Configurações" description="Visualize as configurações do sistema" />


        {loading ? (
          <Card className="border-4 border-black">
            <CardContent className="p-6">
              <Spinner className="size-8" />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-4 border-black">
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Visualize o status atual do processo de votação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status Atual</Label>
                <div className="w-full px-3 py-2 border-2 border-black rounded-md bg-gray-50 text-black">
                  {statusOptions.find((opt) => opt.value === status)?.label || status}
                </div>
                <p className="text-sm text-gray-600">
                  Para alterar as configurações, edite o arquivo database/settings.json
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate">Data do Evento</Label>
                <div className="w-full px-3 py-2 border-2 border-black rounded-md bg-gray-50 text-black">
                  {eventDate || "Não definida"}
                </div>
                <p className="text-sm text-gray-600">
                  Data em que os resultados serão divulgados
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border-2 border-red-500 rounded-md text-red-700">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
