import { NextResponse } from "next/server";
import { getUsers } from "@/lib/db";

// GET - Listar usuários (público, apenas instagram)
export async function GET() {
  try {
    const users = await getUsers();

    // Retornar apenas instagram dos usuários
    const usersList = users.map((user) => ({
      instagram: user.instagram,
    }));

    return NextResponse.json({ users: usersList });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}
