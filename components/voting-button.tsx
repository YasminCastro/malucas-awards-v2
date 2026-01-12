"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VotingWizard } from "@/components/voting-wizard";

interface Participant {
  instagram: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  participants: Participant[];
}

interface VotingButtonProps {
  categories: Category[];
}

export function VotingButton({ categories }: VotingButtonProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleStartVoting = () => {
    setIsVoting(true);
  };

  const handleCloseVoting = () => {
    setIsVoting(false);
  };

  const handleCompleteVoting = (votes: Record<string, string>) => {
    console.log("Votos registrados:", votes);
    // Aqui você pode fazer a chamada para a API para salvar os votos
    setIsVoting(false);
    // Você pode adicionar um toast ou mensagem de sucesso aqui
  };

  return (
    <>
      <Button
        onClick={handleStartVoting}
        className="bg-linear-to-r from-[#f93fff] to-[#f7f908] hover:from-[#e82ff0] hover:to-[#e6ea08] text-black font-bold uppercase h-16 px-10 text-xl rounded-md border-4 border-black shadow-lg transition-all transform hover:scale-105"
      >
        INICIAR VOTAÇÃO
      </Button>

      {isVoting && (
        <VotingWizard
          categories={categories}
          onClose={handleCloseVoting}
          onComplete={handleCompleteVoting}
        />
      )}
    </>
  );
}
