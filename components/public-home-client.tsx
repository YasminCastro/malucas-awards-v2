"use client";

import { useState, useEffect } from "react";
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

type VotingStatus = 
  | "escolhendo-categorias"
  | "pre-votacao"
  | "votacao"
  | "pos-votacao"
  | "resultado";

interface CategoryResult {
  categoryId: string;
  categoryName: string;
  results: Array<{
    participantInstagram: string;
    votes: number;
    voters: string[];
  }>;
  totalVotes: number;
}

interface PublicHomeClientProps {
  categories: Category[];
  votingStatus: VotingStatus;
  eventDate?: string | null;
}

export function PublicHomeClient({ categories, votingStatus, eventDate }: PublicHomeClientProps) {
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    if (votingStatus === "resultado") {
      loadResults();
    }
  }, [votingStatus]);

  const loadResults = async () => {
    setResultsLoading(true);
    try {
      const response = await fetch("/api/results");
      if (response.ok) {
        const data = await response.json();
        setCategoryResults(data.categoryResults || []);
      }
    } catch (error) {
      console.error("Erro ao carregar resultados:", error);
    } finally {
      setResultsLoading(false);
    }
  };

  const getUserImage = (instagram: string) => {
    // Tentar encontrar o participante nas categorias para pegar a imagem correta
    for (const category of categories) {
      const participant = category.participants.find(
        (p) => p.instagram.toLowerCase() === instagram.toLowerCase()
      );
      if (participant) {
        return `/nominees/${participant.image}`;
      }
    }
    // Se não encontrar, usar o padrão
    const username = instagram.replace("@", "");
    return `/nominees/${username}.jpeg`;
  };
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
                  {votingStatus === "pos-votacao" && (
                    <span className="block mt-1 font-medium">
                      {eventDate 
                        ? `O resultado será divulgado no dia ${new Date(eventDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : "O resultado será divulgado no dia do evento"}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {votingStatus === "votacao" && (
              <Link href="/login">
                <Button className="bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 px-8 rounded-md border-2 border-black">
                  Votar
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Categories or Results */}
        {votingStatus === "resultado" ? (
          <div className="space-y-4">
            {resultsLoading ? (
              <div className="bg-white border-4 border-black rounded-lg p-6 text-center">
                <p>Carregando resultados...</p>
              </div>
            ) : (
              categoryResults.map((categoryResult) => {
                const category = categories.find(c => c.id === categoryResult.categoryId);
                if (!category) return null;

                return (
                  <Accordion
                    key={categoryResult.categoryId}
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem
                      value={categoryResult.categoryId}
                      className="bg-white border-4! border-black rounded-lg px-6 border-b-0"
                    >
                      <AccordionTrigger className="py-4 hover:no-underline [&>svg]:text-black">
                        <h2 className="text-2xl font-bold text-black uppercase tracking-tight">
                          {categoryResult.categoryName}
                        </h2>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-6">
                        {categoryResult.results.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {categoryResult.results.map((result, index) => {
                                const position = index + 1;
                                const positionColors = [
                                  "bg-yellow-400 border-yellow-600",
                                  "bg-gray-300 border-gray-500",
                                  "bg-orange-300 border-orange-500",
                                ];
                                const positionLabels = ["🥇", "🥈", "🥉"];

                                return (
                                  <div
                                    key={result.participantInstagram}
                                    className={`border-4 rounded-lg p-4 ${
                                      positionColors[index] || "bg-gray-100 border-gray-400"
                                    }`}
                                  >
                                    <div className="text-center mb-3">
                                      <span className="text-4xl">
                                        {positionLabels[index] || `${position}º`}
                                      </span>
                                      <p className="text-sm font-bold mt-1">
                                        {position}º Lugar
                                      </p>
                                    </div>
                                    <div className="relative w-full aspect-square mb-3 rounded-md overflow-hidden border-2 border-black">
                                      <ParticipantImage
                                        src={getUserImage(result.participantInstagram)}
                                        alt={result.participantInstagram}
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="text-center">
                                      <p className="font-bold text-lg">
                                        {result.participantInstagram}
                                      </p>
                                      <p className="text-sm mt-1">
                                        {result.votes} voto{result.votes !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            Nenhum voto registrado ainda
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              })
            )}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
