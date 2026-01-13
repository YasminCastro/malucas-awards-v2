import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { updateCategorySuggestionStatus } from "@/lib/db";

// PUT - Atualizar status da sugestão (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da sugestão é obrigatório" },
        { status: 400 }
      );
    }

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido. Deve ser: pending, approved ou rejected" },
        { status: 400 }
      );
    }

    const updatedSuggestion = await updateCategorySuggestionStatus(id, status);
    
    return NextResponse.json(
      { 
        success: true, 
        suggestion: {
          id: updatedSuggestion._id,
          suggesterName: updatedSuggestion.suggesterName,
          categoryName: updatedSuggestion.categoryName,
          participants: updatedSuggestion.participants,
          observations: updatedSuggestion.observations,
          status: updatedSuggestion.status,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao atualizar status da sugestão:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}
