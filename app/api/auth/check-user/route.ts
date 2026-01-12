import { NextRequest, NextResponse } from "next/server";
import { getUserByInstagram } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram } = body;

    // Validação
    if (!instagram) {
      return NextResponse.json(
        { error: "Instagram é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await getUserByInstagram(instagram);

    if (!user) {
      return NextResponse.json(
        {
          error: "USER_NOT_FOUND",
          message: "Usuário não encontrado",
        },
        { status: 404 }
      );
    }

    // Verificar se já tem senha
    if (user.hasSetPassword) {
      return NextResponse.json(
        { error: "Você já possui uma senha cadastrada. Faça login em /login" },
        { status: 400 }
      );
    }

    // Usuário existe e pode definir senha
    return NextResponse.json({
      success: true,
      instagram: user.instagram,
    });
  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar usuário" },
      { status: 500 }
    );
  }
}
