"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";

// Componente de imagem com fallback
function ParticipantImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc("/cidf.png");
    }
  };

  // Usar img normal para ter suporte completo a onError
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

interface Participant {
  instagram: string;
  image: string;
}

interface Category {
  _id: string;
  id: string;
  name: string;
  participants: Participant[];
  createdAt: string;
  updatedAt?: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    participants: [] as Participant[],
  });
  const [newParticipant, setNewParticipant] = useState({
    instagram: "",
  });
  const [users, setUsers] = useState<{ instagram: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<{ instagram: string }[]>(
    []
  );

  useEffect(() => {
    checkAdminAndLoadCategories();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      // Silenciosamente falha se não conseguir carregar usuários
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const checkAdminAndLoadCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.status === 401 || response.status === 403) {
        router.push("/");
        return;
      }
      if (!response.ok) {
        throw new Error("Erro ao carregar categorias");
      }
      const data = await response.json();
      setCategories(data.categories);
      setIsAdmin(true);
    } catch (error: any) {
      setError(error.message);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error("Erro ao carregar categorias");
      const data = await response.json();
      setCategories(data.categories);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          participants: formData.participants,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar categoria");
      }

      await loadCategories();
      setFormData({ name: "", participants: [] });
      setShowCreateForm(false);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const response = await fetch(
        `/api/admin/categories/${editingCategory._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            participants: formData.participants,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar categoria");
      }

      await loadCategories();
      setEditingCategory(null);
      setFormData({ name: "", participants: [] });
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar categoria");
      }

      await loadCategories();
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      participants: [...category.participants],
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: "", participants: [] });
    setNewParticipant({ instagram: "" });
    setShowCreateForm(false);
  };

  const handleInstagramChange = (value: string) => {
    setNewParticipant({ instagram: value });

    if (value.trim() === "") {
      setShowSuggestions(false);
      setFilteredUsers([]);
      return;
    }

    // Filtrar usuários que correspondem ao texto digitado
    const searchTerm = value.toLowerCase().replace("@", "");
    const filtered = users
      .filter((user) => {
        const userInstagram = user.instagram.toLowerCase().replace("@", "");
        return userInstagram.includes(searchTerm);
      })
      .slice(0, 5); // Limitar a 5 sugestões

    setFilteredUsers(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const selectUser = (instagram: string) => {
    const formattedInstagram = instagram.startsWith("@")
      ? instagram
      : `@${instagram}`;
    setNewParticipant({ instagram: formattedInstagram });
    setShowSuggestions(false);
    setFilteredUsers([]);
  };

  const addParticipant = () => {
    if (!newParticipant.instagram) {
      alert("Preencha o Instagram");
      return;
    }

    const instagram = newParticipant.instagram.startsWith("@")
      ? newParticipant.instagram
      : `@${newParticipant.instagram}`;

    // Gerar nome da imagem baseado no Instagram (sem @) + .jpeg
    const imageName = instagram.replace("@", "") + ".jpeg";

    setFormData({
      ...formData,
      participants: [
        ...formData.participants,
        {
          instagram,
          image: imageName,
        },
      ],
    });
    setNewParticipant({ instagram: "" });
    setShowSuggestions(false);
    setFilteredUsers([]);
  };

  const removeParticipant = (index: number) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (isAdmin === false) {
    router.push("/");
    return null;
  }

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
                  Gerenciamento de Categorias
                </h1>
                <p className="text-black text-sm mt-1">
                  Gerencie todas as categorias de premiação
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
                className="h-12 px-6"
              >
                Voltar ao Painel
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="h-12 px-6"
              >
                Início
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {(showCreateForm || editingCategory) && (
          <Card className="mb-6 border-4 border-black">
            <CardHeader>
              <CardTitle>
                {editingCategory ? "Editar Categoria" : "Criar Nova Categoria"}
              </CardTitle>
              <CardDescription>
                {editingCategory
                  ? "Atualize as informações da categoria"
                  : "Preencha os dados para criar uma nova categoria"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={
                  editingCategory ? handleUpdateCategory : handleCreateCategory
                }
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: MALUCA DO ANO"
                    required
                  />
                </div>

                <div className="border-2 border-gray-300 rounded-lg p-4 space-y-4">
                  <Label>Participantes</Label>

                  {/* Lista de participantes adicionados */}
                  {formData.participants.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {formData.participants.map((participant, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-300"
                        >
                          <div className="relative w-10 h-10 shrink-0">
                            <ParticipantImage
                              src={`/nominees/${participant.image}`}
                              alt={participant.instagram}
                              className="object-cover rounded"
                            />
                          </div>
                          <span className="flex-1 text-sm">
                            {participant.instagram}
                          </span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeParticipant(index)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulário para adicionar novo participante */}
                  <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-300">
                    <div className="relative">
                      <Label htmlFor="participant-instagram">Instagram</Label>
                      <Input
                        id="participant-instagram"
                        type="text"
                        value={newParticipant.instagram}
                        onChange={(e) => handleInstagramChange(e.target.value)}
                        onFocus={() => {
                          if (newParticipant.instagram.trim() !== "") {
                            handleInstagramChange(newParticipant.instagram);
                          }
                        }}
                        onBlur={() => {
                          // Delay para permitir clique na sugestão
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        placeholder="@usuario ou usuario"
                        autoComplete="off"
                      />
                      {/* Dropdown de sugestões */}
                      {showSuggestions && filteredUsers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredUsers.map((user, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectUser(user.instagram)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                            >
                              <span className="font-medium">
                                @{user.instagram}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        A imagem será gerada automaticamente como: usuario.jpeg
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addParticipant}
                      className="w-full"
                    >
                      Adicionar Participante
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingCategory ? "Atualizar" : "Criar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <Card className="border-4 border-black">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Categorias ({categories.length})</CardTitle>
                <CardDescription>
                  Gerencie todas as categorias de premiação
                </CardDescription>
              </div>
              {!showCreateForm && !editingCategory && (
                <Button onClick={() => setShowCreateForm(true)}>
                  + Nova Categoria
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="border-2 border-black rounded-lg p-4 bg-white flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold text-black uppercase">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {category.participants.length} participante(s)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(category)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma categoria encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
