import { NextResponse } from "next/server";
import { getCategoryResults } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const categoryResults = await getCategoryResults(categoryId || "");

    return NextResponse.json(categoryResults);
  } catch (error: any) {
    console.error("Erro ao buscar resultados:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar resultados" },
      { status: 500 }
    );
  }
}
