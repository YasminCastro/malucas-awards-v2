import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/db";

// GET - Buscar configurações
export async function GET() {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const settings = await getSettings();
    
    // Se não existir configurações, retornar status padrão
    if (!settings) {
      return NextResponse.json({ 
        status: "escolhendo-categorias",
        eventDate: null
      });
    }

    return NextResponse.json({ 
      status: settings.status,
      eventDate: settings.eventDate ? (settings.eventDate instanceof Date ? settings.eventDate.toISOString().split('T')[0] : settings.eventDate) : null
    });
  } catch (error: any) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configurações
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { status, eventDate } = body;

    const validStatuses = [
      "escolhendo-categorias",
      "pre-votacao",
      "votacao",
      "pos-votacao",
      "resultado",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    if (eventDate !== undefined) {
      updateData.eventDate = eventDate || null;
    }

    const settings = await updateSettings(updateData);
    return NextResponse.json({ 
      status: settings.status,
      eventDate: settings.eventDate ? (settings.eventDate instanceof Date ? settings.eventDate.toISOString().split('T')[0] : settings.eventDate) : null
    });
  } catch (error: any) {
    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
