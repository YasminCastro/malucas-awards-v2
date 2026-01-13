import { getCategories } from "@/lib/db";
import { PublicHomeClient } from "@/components/public-home-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function Home() {
  // Buscar categorias do banco de dados (público)
  const categories = await getCategories();

  // Converter para o formato esperado pelos componentes
  const formattedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    participants: category.participants.map((p) => ({
      instagram: p.instagram,
      image: p.image,
    })),
  }));

  return <PublicHomeClient categories={formattedCategories} />;
}
