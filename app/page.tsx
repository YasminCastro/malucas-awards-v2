import { getCategories, getSettings } from "@/lib/db";
import { PublicHomeClient } from "@/components/public-home-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function Home() {
  // Buscar categorias do banco de dados (público)
  const categories = await getCategories();

  // Buscar status de votação
  const settings = await getSettings();
  const votingStatus = settings?.status || "escolhendo-categorias";
  const eventDate = settings?.eventDate 
    ? (settings.eventDate instanceof Date 
        ? settings.eventDate.toISOString().split('T')[0] 
        : settings.eventDate)
    : null;

  // Converter para o formato esperado pelos componentes
  const formattedCategories = categories.map((category) => ({
    _id: String((category as any)._id),
    name: category.name,
    participants: category.participants.map((p) => ({
      instagram: p.instagram,
      image: p.image,
    })),
  }));

  return <PublicHomeClient categories={formattedCategories} votingStatus={votingStatus} eventDate={eventDate} />;
}
