import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import {
  getCategories,
  createCategory,
  type Category,
} from "@/lib/db";

// GET - Listar todas as categorias
export async function GET() {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const categories = await getCategories({ bypassCache: true });
    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar categorias" },
      { status: 500 }
    );
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, participants = [] } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
    }

    if (!Array.isArray(participants)) {
      return NextResponse.json(
        { error: "Participantes deve ser um array" },
        { status: 400 }
      );
    }

    const category = await createCategory(name.trim(), participants);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar categoria:", error);
    // Duplicidade de índice unique (Mongo)
    const msg = String(error?.message || "");
    if (error?.code === 11000 || msg.includes("E11000 duplicate key")) {
      return NextResponse.json(
        { error: "Já existe uma categoria com esse nome" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}
