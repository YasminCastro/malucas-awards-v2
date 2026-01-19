import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { getCategorySuggestions } from "@/lib/db";

// GET - Buscar todas as sugestões (admin)
export async function GET() {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Admin precisa sempre do dado atualizado (evitar cache em memória)
    const suggestions = await getCategorySuggestions({ bypassCache: true });
    
    return NextResponse.json(
      { 
        success: true, 
        suggestions: suggestions.map(suggestion => ({
          id: suggestion._id,
          suggesterName: suggestion.suggesterName,
          categoryName: suggestion.categoryName,
          participants: suggestion.participants || [],
          observations: suggestion.observations,
          status: suggestion.status || "pending",
          createdAt: suggestion.createdAt,
        }))
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Erro ao buscar sugestões de categoria:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar sugestões" },
      { status: 500 }
    );
  }
}
