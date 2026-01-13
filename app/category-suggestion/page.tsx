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

export default function CategorySuggestionPage() {
  const router = useRouter();
  const [suggesterName, setSuggesterName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
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

    if (selectedParticipants.length === 0) {
      setError("Por favor, selecione pelo menos um participante");
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar sugestão");
      }

      setSuccess(true);
      setSuggesterName("");
      setCategoryName("");
      setSelectedParticipants([]);
      setTimeout(() => {
        setSuccess(false);
        router.push("/");
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

        <Card className="border-4 border-black">
          <CardHeader>
            <CardTitle>Sugestão de Categoria</CardTitle>
            <CardDescription>
              Preencha os dados da categoria que você gostaria de sugerir
            </CardDescription>
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
                <Label>Participantes</Label>
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
                  Selecione os participantes para esta categoria
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
      </div>
    </div>
  );
}
