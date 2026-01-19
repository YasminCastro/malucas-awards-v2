import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import {
  updateCategorySuggestionStatus,
  updateCategorySuggestion,
  deleteCategorySuggestion,
} from "@/lib/db";

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

// PATCH - Editar sugestão (admin)
export async function PATCH(
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
    const { suggesterName, categoryName, participants, observations, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da sugestão é obrigatório" },
        { status: 400 }
      );
    }

    if (suggesterName !== undefined && (typeof suggesterName !== "string" || suggesterName.trim() === "")) {
      return NextResponse.json(
        { error: "Nome de quem sugeriu é obrigatório" },
        { status: 400 }
      );
    }

    if (categoryName !== undefined && (typeof categoryName !== "string" || categoryName.trim() === "")) {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
    }

    if (participants !== undefined && !Array.isArray(participants)) {
      return NextResponse.json(
        { error: "Participantes deve ser um array" },
        { status: 400 }
      );
    }

    if (observations !== undefined && typeof observations !== "string") {
      return NextResponse.json(
        { error: "Observações deve ser uma string" },
        { status: 400 }
      );
    }

    if (status !== undefined && !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido. Deve ser: pending, approved ou rejected" },
        { status: 400 }
      );
    }

    const updatedSuggestion = await updateCategorySuggestion(id, {
      suggesterName,
      categoryName,
      participants,
      observations,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        suggestion: {
          id: updatedSuggestion._id,
          suggesterName: updatedSuggestion.suggesterName,
          categoryName: updatedSuggestion.categoryName,
          participants: updatedSuggestion.participants || [],
          observations: updatedSuggestion.observations,
          status: updatedSuggestion.status || "pending",
          createdAt: updatedSuggestion.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao editar sugestão:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao editar sugestão" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir sugestão (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await deleteCategorySuggestion(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Sugestão não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao deletar sugestão:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao deletar sugestão" },
      { status: 500 }
    );
  }
}
