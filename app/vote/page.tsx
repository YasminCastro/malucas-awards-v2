import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getSettings, getUsers } from "@/lib/db";
import { HomeClient } from "@/components/home-client";

export const dynamic = "force-dynamic";

function normalizeInstagram(handle: string): string {
  return handle.replace(/^@/, "").toLowerCase();
}

export default async function VotePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar categorias do banco de dados
  const categories = await getCategories();
  const users = await getUsers();

  const usersByInstagram = new Map(
    users.map((user) => [normalizeInstagram(user.instagram), user])
  );

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
      name:
        usersByInstagram.get(normalizeInstagram(p.instagram))?.name ||
        undefined,
    })),
  }));

  return (
    <HomeClient
      categories={formattedCategories}
      user={user}
      votingStatus={votingStatus}
      eventDate={eventDate}
    />
  );
}
