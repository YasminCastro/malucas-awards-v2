"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Participant {
  instagram: string;
  image: string;
}

interface Category {
  _id: string;
  name: string;
  participants: Participant[];
}

interface VotingWizardProps {
  categories: Category[];
  onClose: () => void;
  onComplete: (votes: Record<string, string>) => void;
  initialVotes?: Record<string, string>;
}

export function VotingWizard({
  categories,
  onClose,
  onComplete,
  initialVotes = {},
}: VotingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>(initialVotes);

  const currentCategory = categories[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === categories.length - 1;
  const progress = ((currentStep + 1) / categories.length) * 100;

  const handleSelectParticipant = (participantInstagram: string) => {
    setVotes({
      ...votes,
      [currentCategory._id]: participantInstagram,
    });
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(votes);
  };

  const selectedParticipant = votes[currentCategory._id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border-4 border-black rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b-4 border-black p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black uppercase tracking-tight">
              VOTAÇÃO
            </h2>
            <p className="text-black text-sm mt-1">
              Categoria {currentStep + 1} de {categories.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 border-b-2 border-black">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-2xl font-bold text-black uppercase tracking-tight mb-6">
            {currentCategory.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategory.participants.map((participant, index) => {
              const isSelected = selectedParticipant === participant.instagram;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectParticipant(participant.instagram)}
                  className={`border-4 rounded-md overflow-hidden transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50 scale-105 shadow-lg"
                      : "border-black hover:bg-gray-50"
                  }`}
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={`/nominees/${participant.image}`}
                      alt={participant.instagram}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div
                    className={`p-3 border-t-4 ${
                      isSelected ? "border-green-500" : "border-black"
                    }`}
                  >
                    <p
                      className={`font-medium text-center text-sm ${
                        isSelected ? "font-bold text-green-700" : ""
                      }`}
                    >
                      {participant.instagram}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-black p-6 flex items-center justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="bg-white border-2 border-black text-black hover:bg-gray-100 font-bold uppercase h-12 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ANTERIOR
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleComplete}
              disabled={!selectedParticipant}
              className="bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 px-8 rounded-md border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              FINALIZAR VOTAÇÃO
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!selectedParticipant}
              className="bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 px-8 rounded-md border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              PRÓXIMO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
