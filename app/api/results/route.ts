import { NextResponse } from "next/server";
import { getAllCategoriesResults, getOneCategoryResults } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (categoryId) {
      const categoryResults = await getOneCategoryResults(categoryId || "");
      return NextResponse.json(categoryResults);
    }

    const categoriesResults = await getAllCategoriesResults();

    return NextResponse.json(categoriesResults);
  } catch (error: any) {
    console.error("Erro ao buscar resultados:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar resultados" },
      { status: 500 }
    );
  }
}
