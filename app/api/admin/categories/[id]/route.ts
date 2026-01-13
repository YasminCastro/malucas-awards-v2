import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/lib/db";

// GET - Buscar categoria por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const category = await getCategoryById(params.id);
    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("Erro ao buscar categoria:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar categoria" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, participants } = body;

    const updates: any = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json(
          { error: "Nome da categoria é obrigatório" },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (participants !== undefined) {
      if (!Array.isArray(participants)) {
        return NextResponse.json(
          { error: "Participantes deve ser um array" },
          { status: 400 }
        );
      }
      updates.participants = participants;
    }

    const category = await updateCategory(params.id, updates);
    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const deleted = await deleteCategory(params.id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar categoria:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao deletar categoria" },
      { status: 500 }
    );
  }
}
