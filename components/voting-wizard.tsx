"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ParticipantImage } from "./participant-image";

interface Participant {
  instagram: string;
  image: string;
  name?: string | null;
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
        <div className="border-b-4 border-black p-6 flex items-center justify-between max-sm:p-4">
          <div>
            <h2 className="text-3xl font-bold text-black tracking-tight max-sm:text-xl">
              VOTAÇÃO
            </h2>
            <p className="text-black text-sm mt-1 max-sm:text-xs">
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
          <h3 className="text-2xl font-bold text-black uppercase tracking-tight mb-6 max-sm:text-lg">
            {currentCategory.name}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {currentCategory.participants.map((participant, index) => {
              const isSelected = selectedParticipant === participant.instagram;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectParticipant(participant.instagram)}
                  className={`border-2 rounded-md overflow-hidden transition-all ${isSelected
                    ? "border-green-500 bg-green-50 scale-105 shadow-lg"
                    : "border-black hover:bg-gray-50"
                    }`}
                >
                  <div className="relative w-full aspect-3/4">
                    <ParticipantImage
                      src={`/nominees/${participant.image}`}
                      alt={participant.name || participant.instagram}
                      className="object-cover"
                    />
                  </div>
                  <div
                    className={`p-1.5 sm:p-2 border-t-2 ${isSelected ? "border-green-500" : "border-black"
                      }`}
                  >
                    <p
                      className={`font-medium text-center text-xs sm:text-sm ${isSelected ? "font-bold text-green-700" : ""
                        }`}
                    >
                      {participant.name || participant.instagram}
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
            className="bg-white border-2 border-black text-black hover:bg-gray-100 font-bold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ANTERIOR
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleComplete}
              disabled={!selectedParticipant}
              className="bg-black font-bold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              FINALIZAR VOTAÇÃO
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!selectedParticipant}
              className="bg-black font-bold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              PRÓXIMO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
