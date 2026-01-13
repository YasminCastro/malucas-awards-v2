import { NextRequest, NextResponse } from "next/server";
import { addParticipantsToSuggestion, getCategorySuggestionById } from "@/lib/db";

// PUT - Adicionar participantes a uma sugestão (público)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { participants } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da sugestão é obrigatório" },
        { status: 400 }
      );
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: "Participantes deve ser um array não vazio" },
        { status: 400 }
      );
    }

    // Verificar se a sugestão existe
    const existingSuggestion = await getCategorySuggestionById(id);
    if (!existingSuggestion) {
      return NextResponse.json(
        { error: "Sugestão não encontrada" },
        { status: 404 }
      );
    }

    // Filtrar apenas participantes que ainda não estão na lista
    const existingParticipants = existingSuggestion.participants || [];
    const newParticipants = participants.filter(
      (p: string) => !existingParticipants.includes(p.trim())
    );

    if (newParticipants.length === 0) {
      return NextResponse.json(
        { error: "Todos os participantes já estão na lista" },
        { status: 400 }
      );
    }

    const updatedSuggestion = await addParticipantsToSuggestion(id, newParticipants);
    
    return NextResponse.json(
      { 
        success: true, 
        suggestion: {
          id: updatedSuggestion._id,
          suggesterName: updatedSuggestion.suggesterName,
          categoryName: updatedSuggestion.categoryName,
          participants: updatedSuggestion.participants,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao adicionar participantes à sugestão:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao adicionar participantes" },
      { status: 500 }
    );
  }
}
