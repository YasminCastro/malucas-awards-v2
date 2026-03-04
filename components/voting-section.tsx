"use client";

import { VotingButton } from "@/components/voting-button";

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

interface VotingSectionProps {
  categories: Category[];
  onVotesSaved?: (votes: Record<string, string>) => void;
}

export function VotingSection({ categories, onVotesSaved }: VotingSectionProps) {
  return (
    <div className="border-t-4 border-black pt-4">
      <VotingButton categories={categories} onVotesSaved={onVotesSaved} />
    </div>
  );
}
