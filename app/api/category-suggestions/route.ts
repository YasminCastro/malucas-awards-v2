import { NextRequest, NextResponse } from "next/server";
import { createCategorySuggestion } from "@/lib/db";

// POST - Criar sugestão de categoria (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suggesterName, categoryName, participants } = body;

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

    if (!Array.isArray(participants)) {
      return NextResponse.json(
        { error: "Participantes deve ser um array" },
        { status: 400 }
      );
    }

    const suggestion = await createCategorySuggestion(
      suggesterName.trim(),
      categoryName.trim(),
      participants
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
