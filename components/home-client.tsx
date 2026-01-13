"use client";

import { useState, useEffect } from "react";
import { LogoutButton } from "@/components/logout-button";
import { VotingSection } from "@/components/voting-section";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ParticipantImage } from "@/components/participant-image";
import { Button } from "@/components/ui/button";
import { CategoryVoteEditor } from "@/components/category-vote-editor";
import { Edit2 } from "lucide-react";

interface Participant {
  instagram: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  participants: Participant[];
}

interface User {
  instagram: string;
  userId: string;
  isAdmin?: boolean;
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

interface HomeClientProps {
  categories: Category[];
  user: User;
  votingStatus: VotingStatus;
  eventDate?: string | null;
}

export function HomeClient({ categories, user, votingStatus, eventDate }: HomeClientProps) {
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    loadUserVotes();
    if (votingStatus === "resultado") {
      loadResults();
    }
  }, [votingStatus]);

  const loadUserVotes = async () => {
    try {
      const response = await fetch("/api/votes/me");
      if (response.ok) {
        const data = await response.json();
        setUserVotes(data.votes || {});
      }
    } catch (error) {
      console.error("Erro ao carregar votos:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const canVote = votingStatus === "votacao";
  const canViewCategories = ["pre-votacao", "votacao", "pos-votacao", "resultado"].includes(votingStatus);

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

  const handleSaveVote = async (
    categoryId: string,
    participantInstagram: string
  ) => {
    if (!canVote) {
      return;
    }

    // Buscar todos os votos atuais e atualizar apenas a categoria específica
    const updatedVotes = {
      ...userVotes,
      [categoryId]: participantInstagram,
    };

    // Salvar todos os votos (a API já gerencia isso)
    const response = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ votes: updatedVotes }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erro ao salvar voto");
    }

    // Atualizar estado local
    setUserVotes(updatedVotes);
  };

  const getStatusMessage = () => {
    switch (votingStatus) {
      case "pre-votacao":
        return "A votação irá abrir em breve!";
      case "pos-votacao":
        return "Resultado disponível na premiação Malucas Awards";
      case "resultado":
        return null; // Não mostrar mensagem, mostrar resultados
      default:
        return null;
    }
  };

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
              <div className="flex gap-2">
                {user.isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/admin")}
                    className="bg-white border-2 border-black text-black hover:bg-gray-100 font-bold uppercase h-12 px-6 rounded-md"
                  >
                    Admin
                  </Button>
                )}
                <LogoutButton />
              </div>
            </div>
            {votingStatus === "votacao" && (
              <VotingSection categories={categories} />
            )}
            {getStatusMessage() && (
              <div className="border-t-4 border-black pt-4">
                <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 text-center">
                  <p className="font-bold text-yellow-800 text-lg">
                    {getStatusMessage()}
                  </p>
                </div>
              </div>
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
        ) : canViewCategories ? (
          <div className="space-y-4">
            {categories.map((category) => {
              const votedParticipant = userVotes[category.id];
              const categoryResult = categoryResults.find(cr => cr.categoryId === category.id);
              
              return (
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
                      {canVote && votedParticipant && (
                        <div className="mb-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCategory(category)}
                            className="flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar Voto
                          </Button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.participants.map((participant, index) => {
                          const isVoted =
                            votedParticipant === participant.instagram;
                          return (
                            <div
                              key={index}
                              className={`border-2 rounded-md overflow-hidden transition-colors ${
                                isVoted
                                  ? "border-green-500 bg-green-50"
                                  : "border-black hover:bg-gray-50"
                              }`}
                            >
                              <div className="relative w-full aspect-square">
                                <ParticipantImage
                                  src={`/nominees/${participant.image}`}
                                  alt={participant.instagram}
                                  className="object-cover"
                                />
                              </div>
                              <div
                                className={`p-3 border-t-2 ${
                                  isVoted ? "border-green-500" : "border-black"
                                }`}
                              >
                                <p
                                  className={`font-medium text-center text-sm ${
                                    isVoted
                                      ? "font-bold text-green-700"
                                      : "text-black"
                                  }`}
                                >
                                  {participant.instagram}
                                  {isVoted && (
                                    <span className="block text-xs mt-1">
                                      ✓ Seu voto
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {canVote && !votedParticipant && (
                        <div className="mt-4 text-center">
                          <Button
                            variant="outline"
                            onClick={() => setEditingCategory(category)}
                            className="flex items-center gap-2 mx-auto"
                          >
                            <Edit2 className="w-4 h-4" />
                            Votar nesta categoria
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </div>
        ) : null}

        {/* Category Vote Editor Modal */}
        {editingCategory && canVote && (
          <CategoryVoteEditor
            categoryId={editingCategory.id}
            categoryName={editingCategory.name}
            participants={editingCategory.participants}
            currentVote={userVotes[editingCategory.id]}
            onClose={() => setEditingCategory(null)}
            onSave={handleSaveVote}
          />
        )}
      </div>
    </div>
  );
}
