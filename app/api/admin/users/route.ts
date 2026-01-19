import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isCurrentUserAdmin } from "@/lib/auth";
import { getUsers, createPreRegisteredUser } from "@/lib/db";

// GET - Listar todos os usuários
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem acessar." },
        { status: 403 }
      );
    }

    const users = await getUsers();

    const usersWithoutPassword = users.map(({ passwordHash, ...user }: any) => {
      return {
        ...user,
      };
    });

    return NextResponse.json({ users: usersWithoutPassword });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Acesso negado. Apenas administradores podem criar usuários.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { instagram, name, isAdmin: userIsAdmin } = body;

    if (!instagram) {
      return NextResponse.json(
        { error: "Instagram é obrigatório" },
        { status: 400 }
      );
    }

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const newUser = await createPreRegisteredUser(
      instagram,
      String(name).trim(),
      Boolean(userIsAdmin)
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser as any;
    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
      },
    });
  } catch (error: any) {
    console.error("Create user error:", error);

    if (error.message === "Usuário já existe") {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }
    if (error.message === "Nome é obrigatório") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
