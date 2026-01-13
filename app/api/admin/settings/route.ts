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
        status: "escolhendo-categorias" 
      });
    }

    return NextResponse.json({ 
      status: settings.status 
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
    const { status } = body;

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

    const settings = await updateSettings({ status });
    return NextResponse.json({ 
      status: settings.status 
    });
  } catch (error: any) {
    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
