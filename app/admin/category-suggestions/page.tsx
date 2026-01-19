"use client";

import { useEffect, useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { AdminHeader } from "@/components/admin-header";
import { Alert } from "@/components/alert";

interface CategorySuggestion {
  id: string;
  suggesterName: string;
  categoryName: string;
  participants: string[];
  observations?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
}

export default function AdminCategorySuggestionsPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await fetch("/api/admin/category-suggestions");
      if (response.status === 401 || response.status === 403) {
        router.push("/");
        return;
      }
      if (!response.ok) {
        throw new Error("Erro ao carregar sugestões");
      }
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/admin/category-suggestions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar status");
      }

      await loadSuggestions();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovada";
      case "rejected":
        return "Rejeitada";
      default:
        return "Pendente";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <AdminHeader title="Sugestões de Categorias" description="Gerencie as sugestões de categorias enviadas" />

        {error && (
          <Alert
            title={`Erro ao carregar sugestões`}
            description={`Ocorreu um erro ao carregar as sugestões. Por favor, tente novamente. \n Erro: ${error}`}
            open={!!error}
            onOpenChange={() => setError(null)}
          />
        )}

        {/* Lista de Sugestões */}
        <Card className="border-4 border-black">
          <CardHeader>
            <CardTitle>Sugestões ({suggestions.length})</CardTitle>
            <CardDescription>
              Marque as sugestões como aprovadas ou rejeitadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <p className="text-center py-8 text-gray-600">
                Nenhuma sugestão encontrada.
              </p>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="border-2 border-black rounded-lg p-4 bg-white"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-black uppercase">
                            {suggestion.categoryName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Sugerido por: <span className="font-semibold">{suggestion.suggesterName}</span>
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-md border text-sm font-semibold ${getStatusColor(suggestion.status)}`}>
                          {getStatusLabel(suggestion.status)}
                        </div>
                      </div>

                      {suggestion.observations && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Observação:</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                            {suggestion.observations}
                          </p>
                        </div>
                      )}

                      {suggestion.participants && suggestion.participants.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Participantes:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.participants.map((participant, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-black"
                              >
                                {participant}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botões de ação */}
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <Button
                          variant={suggestion.status === "approved" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateStatus(suggestion.id, "approved")}
                          disabled={updating === suggestion.id}
                        >
                          {updating === suggestion.id && suggestion.status !== "approved" ? "Atualizando..." : "Aprovar"}
                        </Button>
                        <Button
                          variant={suggestion.status === "rejected" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateStatus(suggestion.id, "rejected")}
                          disabled={updating === suggestion.id}
                        >
                          {updating === suggestion.id && suggestion.status !== "rejected" ? "Atualizando..." : "Rejeitar"}
                        </Button>
                        {suggestion.status !== "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(suggestion.id, "pending")}
                            disabled={updating === suggestion.id}
                          >
                            {updating === suggestion.id ? "Atualizando..." : "Marcar como Pendente"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
