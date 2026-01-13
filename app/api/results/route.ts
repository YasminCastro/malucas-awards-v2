import { NextResponse } from "next/server";
import { getCategories, getCategoryResults } from "@/lib/db";

// GET - Buscar resultados das categorias (público)
export async function GET() {
  try {
    const categories = await getCategories();

    // Calcular resultados para cada categoria
    const results = await Promise.all(
      categories.map(async (category) => {
        const categoryResults = await getCategoryResults(category.id);
        return {
          categoryId: category.id,
          categoryName: category.name,
          results: categoryResults, // Todos os resultados, não apenas top 3
          totalVotes: categoryResults.reduce((sum, r) => sum + r.votes, 0),
        };
      })
    );

    return NextResponse.json({ categoryResults: results });
  } catch (error: any) {
    console.error("Erro ao buscar resultados:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar resultados" },
      { status: 500 }
    );
  }
}
