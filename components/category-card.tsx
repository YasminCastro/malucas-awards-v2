"use client";

import { Category } from "@/database/categories";
import { Accordion, AccordionTrigger, AccordionItem, AccordionContent } from "./ui/accordion";
import { ParticipantImage } from "./participant-image";
import { JWTPayload } from "@/lib/auth";
import { Dispatch, SetStateAction, useState } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "./ui/button";
import { CategoryVoteEditor } from "./category-vote-editor";
import { VotingStatus } from "@/types/settings";
import { CategoryResult } from "@/types/categories";

interface IProps {
    category: Category;
    user: JWTPayload | null;
    votingStatus: VotingStatus;
    userVotes: Record<string, string>;
    setUserVotes: Dispatch<SetStateAction<Record<string, string>>>
    categoryResult: CategoryResult[]
}

export function CategoryCard({ category, user, votingStatus, userVotes, setUserVotes, categoryResult }: IProps) {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const votedParticipant = userVotes[category._id];

    const handleSaveVote = async (
        categoryId: string,
        participantInstagram: string
    ) => {
        const updatedVotes = {
            ...userVotes,
            [categoryId]: participantInstagram,
        };

        const response = await fetch("/api/votes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ votes: updatedVotes }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Erro ao salvar voto");
        }

        setUserVotes(updatedVotes);
    };

    const positionColorsCard = [
        "bg-yellow-50 border-yellow-500 text-yellow-500",
        "bg-gray-50 border-gray-500",
        "bg-orange-50 border-orange-500",
    ];
    const positionIcons = ["🥇", "🥈", "🥉"];

    return (
        <>
            <Accordion
                key={category._id}
                type="single"
                collapsible
                className="w-full"
            >
                <AccordionItem
                    value={category._id}
                    className="bg-white border-4! border-black rounded-lg px-6 border-b-0"
                >
                    <AccordionTrigger className="py-4 hover:no-underline [&>svg]:text-black">
                        <h2 className="text-2xl font-bold text-black uppercase tracking-tight max-sm:text-base">
                            {category.name}
                        </h2>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-6">
                        {user && votingStatus === "votacao" && (
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {votingStatus !== "resultado" && category.participants.map((participant, index) => {
                                const isVoted =
                                    votedParticipant === participant.instagram;

                                return <div
                                    key={index}
                                    className={`border-2 rounded-md overflow-hidden ${isVoted ? "border-green-500 bg-green-50" : "border-black hover:bg-gray-50"} `}
                                >
                                    <div className="relative w-full aspect-3/4">
                                        <ParticipantImage
                                            src={`/nominees/${participant.image}`}
                                            alt={participant.instagram}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className={`p-3 border-t-2 ${isVoted ? "border-green-500" : "border-black"}`}>
                                        <p className={`font-medium text-center text-sm ${isVoted ? "font-bold text-green-700" : "text-black"}`}>
                                            {participant.name || participant.instagram}
                                            {isVoted && (
                                                <span className="block text-xs mt-1">
                                                    ✓ Seu voto
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            })}
                            {votingStatus === "resultado" && categoryResult && category.participants.map((participant, index) => {
                                const isVoted =
                                    votedParticipant === participant.instagram;

                                const participantResult = categoryResult.find((result) => result.participantInstagram === participant.instagram);
                                let cardColor = null

                                if (participantResult) {
                                    cardColor = positionColorsCard[participantResult.position - 1];
                                }

                                return <div
                                    key={index}
                                    className={`border-2 rounded-md overflow-hidden ${cardColor ? cardColor : "border-black "} `}
                                >
                                    <div className="relative w-full aspect-3/4">
                                        <ParticipantImage
                                            src={`/nominees/${participant.image}`}
                                            alt={participant.instagram}
                                            className="object-cover"
                                        />
                                        {participantResult && participantResult.position <= 3 && (
                                            <span className="absolute top-2 left-2 text-3xl drop-shadow-md">
                                                {positionIcons[participantResult.position - 1]}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`p-3 border-t-2 text-center ${cardColor ? cardColor : "border-black"}`}>
                                        <p className={`font-medium text-base ${cardColor ? cardColor : "text-black"}`}>{participant.name || participant.instagram}</p>

                                        <p className="text-xs">Quantidade de votos: {participantResult ? participantResult.votes : 0}</p>

                                        {isVoted && (
                                            <span className="block text-sm mt-1 text-green-700">
                                                ✓ Seu voto
                                            </span>
                                        )}

                                    </div>
                                </div>
                            })}

                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            {user && votingStatus === "votacao" && editingCategory && (
                <CategoryVoteEditor
                    categoryId={editingCategory._id}
                    categoryName={editingCategory.name}
                    participants={editingCategory.participants}
                    currentVote={userVotes[editingCategory._id]}
                    onClose={() => setEditingCategory(null)}
                    onSave={handleSaveVote}
                />
            )}
        </>
    );
}
