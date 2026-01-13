"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  instagram: string;
}

interface CategorySuggestion {
  id: string;
  suggesterName: string;
  categoryName: string;
  participants: string[];
  observations?: string;
  createdAt?: Date;
}

export default function CategorySuggestionPage() {
  const router = useRouter();
  const [suggesterName, setSuggesterName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [observations, setObservations] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [addingParticipants, setAddingParticipants] = useState<string | null>(null);
  const [selectedParticipantsToAdd, setSelectedParticipantsToAdd] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadUsers();
    loadSuggestions();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users/public");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      // Adicionar timestamp para evitar cache
      const timestamp = Date.now();
      const response = await fetch(`/api/category-suggestions?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Erro ao carregar sugestões:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddParticipantsToggle = (suggestionId: string, instagram: string) => {
    setSelectedParticipantsToAdd((prev) => {
      const current = prev[suggestionId] || [];
      if (current.includes(instagram)) {
        return {
          ...prev,
          [suggestionId]: current.filter((p) => p !== instagram),
        };
      } else {
        return {
          ...prev,
          [suggestionId]: [...current, instagram],
        };
      }
    });
  };

  const handleAddParticipants = async (suggestionId: string) => {
    const participantsToAdd = selectedParticipantsToAdd[suggestionId] || [];
    if (participantsToAdd.length === 0) {
      setError("Selecione pelo menos um participante para adicionar");
      return;
    }

    setAddingParticipants(suggestionId);
    setError(null);

    try {
      const response = await fetch(`/api/category-suggestions/${suggestionId}/participants`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participants: participantsToAdd,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar participantes");
      }

      setSelectedParticipantsToAdd((prev) => {
        const updated = { ...prev };
        delete updated[suggestionId];
        return updated;
      });
      setExpandedSuggestion(null);
      
      // Forçar reload das sugestões (invalidar cache no servidor já foi feito)
      setLoadingSuggestions(true);
      await loadSuggestions();
    } catch (error: any) {
      setError(error.message || "Erro ao adicionar participantes");
    } finally {
      setAddingParticipants(null);
    }
  };

  const getAvailableParticipants = (suggestion: CategorySuggestion) => {
    const existingParticipants = suggestion.participants || [];
    return users.filter((user) => !existingParticipants.includes(user.instagram));
  };

  const handleParticipantToggle = (instagram: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(instagram)
        ? prev.filter((p) => p !== instagram)
        : [...prev, instagram]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!suggesterName.trim()) {
      setError("Por favor, digite seu nome");
      return;
    }

    if (!categoryName.trim()) {
      setError("Por favor, digite o nome da categoria");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/category-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggesterName: suggesterName.trim(),
          categoryName: categoryName.trim(),
          participants: selectedParticipants,
          observations: observations.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar sugestão");
      }

      setSuccess(true);
      setSuggesterName("");
      setCategoryName("");
      setObservations("");
      setSelectedParticipants([]);
      await loadSuggestions(); // Recarregar a lista após envio
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false); // Fechar formulário após sucesso
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Erro ao enviar sugestão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-2xl mx-auto">
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
                  Sugerir Categoria
                </h1>
                <p className="text-black text-sm mt-1">
                  Envie sua sugestão de categoria para os Malucas Awards
                </p>
              </div>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                className="h-12 px-6 border-2 border-black"
              >
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        {/* Botão para mostrar/esconder formulário */}
        {!showForm && (
          <Card className="border-4 border-black mb-6">
            <CardContent className="pt-6">
              <Button
                onClick={() => setShowForm(true)}
                className="w-full"
                size="lg"
              >
                Sugerir Categoria
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Sugestão */}
        {showForm && (
          <Card className="border-4 border-black mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sugestão de Categoria</CardTitle>
                  <CardDescription>
                    Preencha os dados da categoria que você gostaria de sugerir
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setError(null);
                    setSuccess(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="suggesterName">Seu Nome</Label>
                <Input
                  id="suggesterName"
                  type="text"
                  value={suggesterName}
                  onChange={(e) => setSuggesterName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryName">Nome da Categoria</Label>
                <Input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Melhor Meme do Ano"
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observação (Opcional)</Label>
                <textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Explique mais sobre a categoria e por que ela deveria ser incluída"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  disabled={loading}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Participantes (Opcional)</Label>
                {loadingUsers ? (
                  <p className="text-sm text-gray-600">Carregando participantes...</p>
                ) : (
                  <div className="border-2 border-black rounded-md p-4 max-h-64 overflow-y-auto bg-white">
                    {users.length === 0 ? (
                      <p className="text-sm text-gray-600">Nenhum participante disponível</p>
                    ) : (
                      <div className="space-y-2">
                        {users.map((user) => (
                          <label
                            key={user.instagram}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedParticipants.includes(user.instagram)}
                              onChange={() => handleParticipantToggle(user.instagram)}
                              disabled={loading}
                              className="w-4 h-4 border-2 border-black rounded"
                            />
                            <span className="text-sm font-medium">{user.instagram}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  Selecione os participantes para esta categoria (opcional)
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border-2 border-red-500 rounded-md text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-100 border-2 border-green-500 rounded-md text-green-700">
                  Sugestão enviada com sucesso! Redirecionando...
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Enviando..." : "Enviar Sugestão"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        )}

        {/* Lista de Sugestões */}
        <Card className="border-4 border-black mt-6">
          <CardHeader>
            <CardTitle>Sugestões Enviadas</CardTitle>
            <CardDescription>
              Veja todas as sugestões de categorias que foram enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSuggestions ? (
              <p className="text-center py-8 text-gray-600">Carregando sugestões...</p>
            ) : suggestions.length === 0 ? (
              <p className="text-center py-8 text-gray-600">Nenhuma sugestão enviada ainda.</p>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="border-2 border-black rounded-lg p-4 bg-white"
                  >
                    <div className="flex flex-col gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-black uppercase">
                          {suggestion.categoryName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Sugerido por: <span className="font-semibold">{suggestion.suggesterName}</span>
                        </p>
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
                          <p className="text-sm font-semibold text-gray-700 mb-2">Participantes sugeridos:</p>
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

                      {/* Botão para adicionar participantes */}
                      <div className="border-t border-gray-200 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (expandedSuggestion === suggestion.id) {
                              setExpandedSuggestion(null);
                            } else {
                              setExpandedSuggestion(suggestion.id);
                            }
                          }}
                          className="w-full"
                        >
                          {expandedSuggestion === suggestion.id
                            ? "Cancelar"
                            : "Adicionar Participantes"}
                        </Button>

                        {expandedSuggestion === suggestion.id && (
                          <div className="mt-3 space-y-3">
                            {getAvailableParticipants(suggestion).length === 0 ? (
                              <p className="text-sm text-gray-600 text-center py-2">
                                Todos os participantes já foram adicionados
                              </p>
                            ) : (
                              <>
                                <div className="border-2 border-black rounded-md p-3 max-h-48 overflow-y-auto bg-white">
                                  <div className="space-y-2">
                                    {getAvailableParticipants(suggestion).map((user) => (
                                      <label
                                        key={user.instagram}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={
                                            (selectedParticipantsToAdd[suggestion.id] || []).includes(
                                              user.instagram
                                            )
                                          }
                                          onChange={() =>
                                            handleAddParticipantsToggle(suggestion.id, user.instagram)
                                          }
                                          disabled={addingParticipants === suggestion.id}
                                          className="w-4 h-4 border-2 border-black rounded"
                                        />
                                        <span className="text-sm font-medium">{user.instagram}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => handleAddParticipants(suggestion.id)}
                                  disabled={
                                    addingParticipants === suggestion.id ||
                                    (selectedParticipantsToAdd[suggestion.id] || []).length === 0
                                  }
                                  className="w-full"
                                >
                                  {addingParticipants === suggestion.id
                                    ? "Adicionando..."
                                    : "Adicionar Selecionados"}
                                </Button>
                              </>
                            )}
                          </div>
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
