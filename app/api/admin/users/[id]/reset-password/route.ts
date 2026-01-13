import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isCurrentUserAdmin } from "@/lib/auth";
import { resetUserPassword } from "@/lib/db";

// POST - Resetar senha do usuário (remove passwordHash e permite que o usuário crie nova senha)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
          error: "Acesso negado. Apenas administradores podem resetar senhas.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Remove passwordHash e define hasSetPassword como false
    await resetUserPassword(id);

    return NextResponse.json({
      success: true,
      message:
        "Senha resetada com sucesso. O usuário poderá criar uma nova senha.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);

    if (error.message === "Usuário não encontrado") {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao resetar senha" },
      { status: 500 }
    );
  }
}
