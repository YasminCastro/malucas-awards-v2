import { NextRequest, NextResponse } from "next/server";
import { getUserByInstagram, updateUserPassword } from "@/lib/db";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram, password } = body;

    if (!instagram || !password) {
      return NextResponse.json(
        { error: "Instagram e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existingUser = await getUserByInstagram(instagram);

    if (!existingUser) {
      return NextResponse.json(
        {
          error:
            "Usuário não encontrado. Entre em contato com o administrador para ser cadastrado.",
        },
        { status: 404 }
      );
    }

    if (existingUser.hasSetPassword) {
      return NextResponse.json(
        { error: "Você já possui uma senha cadastrada. Faça login em /login" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const updatedUser = await updateUserPassword(instagram, passwordHash);

    const token = generateToken({
      userId: updatedUser._id,
      instagram: updatedUser.instagram,
      isAdmin: updatedUser.isAdmin,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        _id: updatedUser._id,
        instagram: updatedUser.instagram,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.message === "Usuário não encontrado") {
      return NextResponse.json(
        {
          error:
            "Usuário não encontrado. Entre em contato com o administrador para ser cadastrado.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao definir senha" },
      { status: 500 }
    );
  }
}
