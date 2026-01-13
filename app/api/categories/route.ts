import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/db";

// GET - Listar todas as categorias (para usuários autenticados)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar categorias" },
      { status: 500 }
    );
  }
}
