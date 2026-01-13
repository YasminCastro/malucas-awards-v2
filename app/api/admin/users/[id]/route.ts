import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isCurrentUserAdmin } from "@/lib/auth";
import { getUserById, updateUser, deleteUser } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// Função auxiliar para converter _id para string
function normalizeUser(user: any) {
  const userId =
    typeof user._id === "string" ? user._id : user._id?.toString() || user._id;
  return {
    ...user,
    _id: userId,
  };
}

// PUT - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem atualizar usuários.",
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { instagram, password, hasSetPassword, isAdmin: userIsAdmin } = body;

    const updates: any = {};

    if (instagram !== undefined) {
      updates.instagram = instagram;
    }

    if (hasSetPassword !== undefined) {
      updates.hasSetPassword = hasSetPassword;
    }

    if (userIsAdmin !== undefined) {
      updates.isAdmin = userIsAdmin;
    }

    // Se senha foi fornecida, atualizar senha
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "A senha deve ter pelo menos 6 caracteres" },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(password);
      const user = await getUserById(id);

      if (!user) {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 404 }
        );
      }

      const { updateUserPassword } = await import("@/lib/db");
      await updateUserPassword(user.instagram, passwordHash);
      updates.hasSetPassword = true;
    }

    const updatedUser = await updateUser(id, updates);
    const normalized = normalizeUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: {
        _id: normalized._id,
        instagram: normalized.instagram,
        hasSetPassword: normalized.hasSetPassword,
        isAdmin: normalized.isAdmin,
        createdAt:
          normalized.createdAt instanceof Date
            ? normalized.createdAt.toISOString()
            : normalized.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Update user error:", error);

    if (error.message === "Usuário não encontrado") {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem deletar usuários.",
        },
        { status: 403 }
      );
    }

    const { id } = params;

    // Não permitir que admin delete a si mesmo
    if (id === currentUser.userId) {
      return NextResponse.json(
        { error: "Você não pode deletar sua própria conta" },
        { status: 400 }
      );
    }

    const deleted = await deleteUser(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuário deletado com sucesso",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Erro ao deletar usuário" },
      { status: 500 }
    );
  }
}
