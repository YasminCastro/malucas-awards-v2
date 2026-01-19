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
import { AdminHeader } from "@/components/admin-header";
import { Alert } from "@/components/alert";
import { Spinner } from "@/components/ui/spinner";

interface User {
  _id: string;
  instagram: string;
  hasSetPassword: boolean;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    instagram: "",
    isAdmin: false,
  });

  useEffect(() => {
    checkAdminAndLoadUsers();
  }, []);

  const checkAdminAndLoadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.status === 401 || response.status === 403) {
        router.push("/");
        return;
      }
      if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
      }
      const data = await response.json();
      setUsers(data.users);
      setIsAdmin(true);
    } catch (error: any) {
      setError(error.message);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Erro ao carregar usuários");
      const data = await response.json();
      setUsers(data.users);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagram: formData.instagram,
          isAdmin: formData.isAdmin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar usuário");
      }

      await loadUsers();
      setFormData({ instagram: "", isAdmin: false });
      // setShowCreateForm(false);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagram: formData.instagram,
          isAdmin: formData.isAdmin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar usuário");
      }

      await loadUsers();
      setEditingUser(null);
      setFormData({ instagram: "", isAdmin: false });
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar usuário");
      }

      await loadUsers();
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const requestDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteUserDialogOpen(true);
  };

  const handleResetPassword = async (id: string, instagram: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}/reset-password`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao resetar senha");
      }

      await loadUsers();
      setError(null);
      setSuccessMessage(`Senha do usuário @${instagram} resetada com sucesso!`);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const requestResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setResetPasswordDialogOpen(true);
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      instagram: user.instagram,
      isAdmin: user.isAdmin || false,
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ instagram: "", isAdmin: false });
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] flex items-center justify-center">
        <Spinner className="size-8" />
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
        <AdminHeader title="Gerenciamento de Usuários" description="Gerencie todos os usuários do sistema" />

        {/* Error Message */}
        {error && (
          <Alert
            title={`Erro ao ${editingUser ? "atualizar" : "criar"} usuário`}
            description={`Ocorreu um erro ao ${editingUser ? "atualizar" : "criar"} o usuário. Por favor, tente novamente. \n Erro: ${error}`}
            open={!!error}
            onOpenChange={() => setError(null)}
          />
        )}

        {/* Delete confirmation */}
        {userToDelete && (
          <Alert
            title="Deletar usuário"
            description={`Tem certeza que deseja deletar o usuário @${userToDelete.instagram}?\nEssa ação não pode ser desfeita.`}
            open={deleteUserDialogOpen}
            onOpenChange={(open) => {
              setDeleteUserDialogOpen(open);
              if (!open) setUserToDelete(null);
            }}
            cancelText="Cancelar"
            confirmText="Deletar"
            onConfirm={() => {
              const id = userToDelete._id;
              setDeleteUserDialogOpen(false);
              setUserToDelete(null);
              void handleDeleteUser(id);
            }}
          />
        )}

        {/* Reset password confirmation */}
        {userToResetPassword && (
          <Alert
            title="Resetar senha"
            description={`Tem certeza que deseja resetar a senha do usuário @${userToResetPassword.instagram}?`}
            open={resetPasswordDialogOpen}
            onOpenChange={(open) => {
              setResetPasswordDialogOpen(open);
              if (!open) setUserToResetPassword(null);
            }}
            cancelText="Cancelar"
            confirmText="Resetar"
            onConfirm={() => {
              const { _id, instagram } = userToResetPassword;
              setResetPasswordDialogOpen(false);
              setUserToResetPassword(null);
              void handleResetPassword(_id, instagram);
            }}
          />
        )}

        {/* Success message */}
        {successMessage && (
          <Alert
            title="Sucesso"
            description={successMessage}
            open={!!successMessage}
            onOpenChange={() => setSuccessMessage(null)}
          />
        )}


        {/* Create/Edit Form */}
        {(showCreateForm || editingUser) && (
          <Card className="mb-6 border-4 border-black">
            <CardHeader>
              <CardTitle>
                {editingUser ? "Editar Usuário" : "Criar Novo Usuário"}
              </CardTitle>
              <CardDescription>
                {editingUser
                  ? "Atualize as informações do usuário"
                  : "Preencha os dados para criar um novo usuário"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="text"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    placeholder="@usuario"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={formData.isAdmin}
                    onChange={(e) =>
                      setFormData({ ...formData, isAdmin: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isAdmin" className="cursor-pointer">
                    Administrador
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingUser ? "Atualizar" : "Criar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card className="border-4 border-black">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usuários ({users.length})</CardTitle>
                <CardDescription>
                  Gerencie todos os usuários do sistema
                </CardDescription>
              </div>
              {!showCreateForm && !editingUser && (
                <Button onClick={() => setShowCreateForm(true)}>
                  + Novo Usuário
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left p-3 font-bold">Instagram</th>
                    <th className="text-left p-3 font-bold">Senha Definida</th>
                    <th className="text-left p-3 font-bold">Admin</th>
                    <th className="text-left p-3 font-bold">
                      Última Atualização
                    </th>
                    <th className="text-right p-3 font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium">@{user.instagram}</td>
                      <td className="p-3">
                        {user.hasSetPassword ? (
                          <span className="text-green-600">✓ Sim</span>
                        ) : (
                          <span className="text-orange-600">✗ Não</span>
                        )}
                      </td>
                      <td className="p-3">
                        {user.isAdmin ? (
                          <span className="text-blue-600 font-bold">Admin</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {user.updatedAt
                          ? new Date(user.updatedAt).toLocaleDateString("pt-BR")
                          : "N/A"}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(user)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              requestResetPassword(user)
                            }
                          >
                            Resetar Senha
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => requestDeleteUser(user)}
                          >
                            Deletar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
