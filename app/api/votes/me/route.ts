import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getVotesByUser } from "@/lib/db";

// GET - Buscar votos do usuário atual
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const votes = await getVotesByUser(currentUser.userId);

    // Converter para o formato esperado: { categoryId: participantInstagram }
    const votesMap: Record<string, string> = {};
    for (const vote of votes) {
      votesMap[vote.categoryId] = vote.participantInstagram;
    }

    return NextResponse.json({ votes: votesMap });
  } catch (error: any) {
    console.error("Erro ao buscar votos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar votos" },
      { status: 500 }
    );
  }
}
