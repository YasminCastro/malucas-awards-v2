import { NextRequest, NextResponse } from "next/server";
import { createCategorySuggestion, getCategorySuggestions } from "@/lib/db";

// GET - Buscar todas as sugestões (público)
export async function GET() {
  try {
    const suggestions = await getCategorySuggestions();
    
    const response = NextResponse.json(
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
      { status: 200 }
    );
    
    // Headers para evitar cache
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    
    return response;
  } catch (error: any) {
    console.error("Erro ao buscar sugestões de categoria:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar sugestões" },
      { status: 500 }
    );
  }
}

// POST - Criar sugestão de categoria (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suggesterName, categoryName, participants, observations } = body;

    if (!suggesterName || typeof suggesterName !== "string" || suggesterName.trim() === "") {
      return NextResponse.json(
        { error: "Nome da pessoa é obrigatório" },
        { status: 400 }
      );
    }

    if (!categoryName || typeof categoryName !== "string" || categoryName.trim() === "") {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a categoria já foi sugerida (comparação case-insensitive)
    const existingSuggestions = await getCategorySuggestions();
    const trimmedCategoryName = categoryName.trim();
    const categoryExists = existingSuggestions.some(
      (suggestion) => suggestion.categoryName.trim().toLowerCase() === trimmedCategoryName.toLowerCase()
    );

    if (categoryExists) {
      return NextResponse.json(
        { error: "Esta categoria já está na lista de sugestões" },
        { status: 409 }
      );
    }

    // Participantes é opcional, mas se fornecido deve ser um array
    const participantsArray = Array.isArray(participants) ? participants : [];

    const suggestion = await createCategorySuggestion(
      suggesterName.trim(),
      categoryName.trim(),
      participantsArray,
      observations
    );
    
    return NextResponse.json(
      { 
        success: true, 
        suggestion: {
          id: suggestion._id,
          suggesterName: suggestion.suggesterName,
          categoryName: suggestion.categoryName,
          participants: suggestion.participants,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro ao criar sugestão de categoria:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao enviar sugestão" },
      { status: 500 }
    );
  }
}
