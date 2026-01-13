import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveVotes, getAllVotes, getSettings } from "@/lib/db";
import { getCategories } from "@/lib/db";

// POST - Salvar votos do usuário
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se o status permite votação
    const settings = await getSettings();
    const votingStatus = settings?.status || "escolhendo-categorias";
    
    if (votingStatus !== "votacao") {
      return NextResponse.json(
        { error: "A votação não está aberta no momento" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { votes } = body;

    if (!votes || typeof votes !== "object") {
      return NextResponse.json({ error: "Votos inválidos" }, { status: 400 });
    }

    // Buscar categorias para obter os nomes
    const categories = await getCategories();
    const categoriesMap = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));

    const savedVotes = await saveVotes(
      currentUser.userId,
      currentUser.instagram,
      votes,
      categoriesMap
    );

    return NextResponse.json({ success: true, votes: savedVotes });
  } catch (error: any) {
    console.error("Erro ao salvar votos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao salvar votos" },
      { status: 500 }
    );
  }
}

// GET - Buscar todos os votos (apenas admin)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const votes = await getAllVotes();
    return NextResponse.json({ votes });
  } catch (error: any) {
    console.error("Erro ao buscar votos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar votos" },
      { status: 500 }
    );
  }
}
