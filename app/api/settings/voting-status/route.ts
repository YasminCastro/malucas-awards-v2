import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

// GET - Buscar status de votação (público)
export async function GET() {
  try {
    const settings = await getSettings();
    
    // Se não existir configurações, retornar status padrão
    const status = settings?.status || "escolhendo-categorias";

    return NextResponse.json({ status });
  } catch (error: any) {
    console.error("Erro ao buscar status de votação:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar status de votação" },
      { status: 500 }
    );
  }
}
