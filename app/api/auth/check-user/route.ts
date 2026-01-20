import { NextRequest, NextResponse } from "next/server";
import { getSettings, getUserByInstagram } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram } = body;

    if (!instagram) {
      return NextResponse.json(
        { error: "Instagram é obrigatório" },
        { status: 400 }
      );
    }

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

    // Bloquear criação de senha enquanto o projeto estiver escolhendo categorias (apenas não-admin)
    const isAdmin = user.isAdmin || false;
    if (!isAdmin) {
      const settings = await getSettings();
      const status = settings?.status || "escolhendo-categorias";

      if (status === "escolhendo-categorias") {
        return NextResponse.json(
          {
            error: "PASSWORD_CREATION_NOT_AVAILABLE",
            message: "Ainda não é possível criar uma senha. Aguarde a liberação.",
            status,
          },
          { status: 403 }
        );
      }
    }

    if (user.hasSetPassword) {
      return NextResponse.json(
        { error: "Você já possui uma senha cadastrada. Faça login em /login" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      instagram: user.instagram,
      isAdmin,
    });
  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar usuário" },
      { status: 500 }
    );
  }
}
