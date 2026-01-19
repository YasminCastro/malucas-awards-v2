"use client";

import { VotingButton } from "@/components/voting-button";

interface Participant {
  instagram: string;
  image: string;
}

interface Category {
  _id: string;
  name: string;
  participants: Participant[];
}

interface VotingSectionProps {
  categories: Category[];
}

export function VotingSection({ categories }: VotingSectionProps) {
  return (
    <div className="border-t-4 border-black pt-4">
      <VotingButton categories={categories} />
    </div>
  );
}
