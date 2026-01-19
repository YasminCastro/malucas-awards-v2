import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/db";

// GET - Buscar configurações (apenas leitura)
export async function GET() {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const settings = await getSettings();

    if (!settings) {
      return NextResponse.json({
        status: "escolhendo-categorias",
        eventDate: null,
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}
