"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ParticipantImage } from "@/components/participant-image";

interface Participant {
  instagram: string;
  image: string;
}

interface CategoryVoteEditorProps {
  categoryId: string;
  categoryName: string;
  participants: Participant[];
  currentVote?: string;
  onClose: () => void;
  onSave: (categoryId: string, participantInstagram: string) => Promise<void>;
}

export function CategoryVoteEditor({
  categoryId,
  categoryName,
  participants,
  currentVote,
  onClose,
  onSave,
}: CategoryVoteEditorProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<
    string | undefined
  >(currentVote);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedParticipant(currentVote);
  }, [currentVote]);

  const handleSave = async () => {
    if (!selectedParticipant) return;

    setSaving(true);
    try {
      await onSave(categoryId, selectedParticipant);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar voto:", error);
      alert("Erro ao salvar voto. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border-4 border-black rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b-4 border-black p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black uppercase tracking-tight">
              Editar Voto
            </h2>
            <p className="text-black text-sm mt-1">{categoryName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant, index) => {
              const isSelected = selectedParticipant === participant.instagram;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedParticipant(participant.instagram)}
                  className={`border-4 rounded-md overflow-hidden transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50 scale-105 shadow-lg"
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
        <div className="border-t-4 border-black p-6 flex items-center justify-end gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white border-2 border-black text-black hover:bg-gray-100 font-bold uppercase h-12 px-6 rounded-md"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedParticipant || saving}
            className="bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 px-8 rounded-md border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : "Salvar Voto"}
          </Button>
        </div>
      </div>
    </div>
  );
}
