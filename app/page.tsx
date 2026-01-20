import { getCategories, getSettings } from "@/lib/db";
import { PublicHomeClient } from "@/components/public-home-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Buscar categorias do banco de dados (público)
  const categories = await getCategories();

  // Buscar status de votação
  const settings = await getSettings();
  const votingStatus = settings?.status || "escolhendo-categorias";
  const eventDate = settings?.eventDate
    ? settings.eventDate.split("T")[0]
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
