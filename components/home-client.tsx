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

interface HomeClientProps {
  categories: Category[];
  user: User;
}

export function HomeClient({ categories, user }: HomeClientProps) {
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserVotes();
  }, []);

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

  const handleSaveVote = async (
    categoryId: string,
    participantInstagram: string
  ) => {
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
            <VotingSection categories={categories} />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const votedParticipant = userVotes[category.id];
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
                    {votedParticipant && (
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
                    {!votedParticipant && (
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

        {/* Category Vote Editor Modal */}
        {editingCategory && (
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
