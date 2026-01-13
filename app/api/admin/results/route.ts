import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { getCategories, getCategoryResults, getAllVotes } from "@/lib/db";

// GET - Buscar resultados das categorias
export async function GET() {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const categories = await getCategories();
    const allVotes = await getAllVotes();

    // Calcular resultados para cada categoria
    const results = await Promise.all(
      categories.map(async (category) => {
        const categoryResults = await getCategoryResults(category.id);
        return {
          categoryId: category.id,
          categoryName: category.name,
          results: categoryResults.slice(0, 3), // Top 3
          totalVotes: categoryResults.reduce((sum, r) => sum + r.votes, 0),
        };
      })
    );

    // Agrupar votos por usuário
    const votesByUser: Record<
      string,
      Array<{ categoryName: string; participantInstagram: string }>
    > = {};

    for (const vote of allVotes) {
      if (!votesByUser[vote.userInstagram]) {
        votesByUser[vote.userInstagram] = [];
      }
      votesByUser[vote.userInstagram].push({
        categoryName: vote.categoryName,
        participantInstagram: vote.participantInstagram,
      });
    }

    return NextResponse.json({
      categoryResults: results,
      userVotes: votesByUser,
    });
  } catch (error: any) {
    console.error("Erro ao buscar resultados:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar resultados" },
      { status: 500 }
    );
  }
}
