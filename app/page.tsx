import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { VotingSection } from "@/components/voting-section";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCategories } from "@/lib/db";
import { ParticipantImage } from "@/components/participant-image";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar categorias do banco de dados
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

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Malucas Awards Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-black uppercase tracking-tight">
                    MALUCAS AWARDS 2026
                  </h1>
                  <p className="text-black text-sm mt-1">
                    Bem-vindo,{" "}
                    <span className="font-bold">@{user.instagram}</span>
                  </p>
                </div>
              </div>
              <LogoutButton />
            </div>
            <VotingSection categories={formattedCategories} />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {formattedCategories.map((category) => (
            <Accordion
              key={category.id}
              type="single"
              collapsible
              className="w-full"
            >
              <AccordionItem
                value={category.id}
                className="bg-white border-4! border-black rounded-lg px-6 border-b-0"
              >
                <AccordionTrigger className="py-4 hover:no-underline [&>svg]:text-black">
                  <h2 className="text-2xl font-bold text-black uppercase tracking-tight">
                    {category.name}
                  </h2>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.participants.map((participant, index) => (
                      <div
                        key={index}
                        className="border-2 border-black rounded-md overflow-hidden hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative w-full aspect-square">
                          <ParticipantImage
                            src={`/nominees/${participant.image}`}
                            alt={participant.instagram}
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3 border-t-2 border-black">
                          <p className="text-black font-medium text-center text-sm">
                            {participant.instagram}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  );
}
