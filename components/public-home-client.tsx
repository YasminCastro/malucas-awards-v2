"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ParticipantImage } from "@/components/participant-image";
import { Button } from "@/components/ui/button";

interface Participant {
  instagram: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  participants: Participant[];
}

interface PublicHomeClientProps {
  categories: Category[];
}

export function PublicHomeClient({ categories }: PublicHomeClientProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-lg p-6 mb-6">
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
                  Premiação anual dos melhores momentos
                </p>
              </div>
            </div>
            <Link href="/login">
              <Button className="bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 px-8 rounded-md border-2 border-black">
                Votar
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
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
          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-white border-4 border-black rounded-lg">
              Nenhuma categoria cadastrada ainda
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
