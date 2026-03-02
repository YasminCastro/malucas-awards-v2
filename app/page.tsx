import { getCategories, getSettings, getUsers } from "@/lib/db";
import { PublicHomeClient } from "@/components/public-home-client";

export const dynamic = "force-dynamic";

function normalizeInstagram(handle: string): string {
  return handle.replace(/^@/, "").toLowerCase();
}

export default async function Home() {
  const categories = await getCategories();
  const users = await getUsers();

  const usersByInstagram = new Map(
    users.map((user) => [normalizeInstagram(user.instagram), user])
  );

  const settings = await getSettings();
  const votingStatus = settings?.status || "escolhendo-categorias";
  const eventDate = settings?.eventDate
    ? settings.eventDate.split("T")[0]
    : null;

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
    <PublicHomeClient
      categories={formattedCategories}
      votingStatus={votingStatus}
      eventDate={eventDate}
    />
  );
}
