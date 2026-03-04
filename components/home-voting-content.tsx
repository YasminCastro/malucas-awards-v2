"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { CategoryCardWrapper } from "@/components/category-card-wrapper";
import { Category } from "@/database/categories";
import { JWTPayload } from "@/lib/auth";
import { VotingStatus } from "@/types/settings";

interface HomeVotingContentProps {
  categories: Category[];
  user: JWTPayload | null;
  votingStatus: VotingStatus;
}

export function HomeVotingContent({
  categories,
  user,
  votingStatus,
}: HomeVotingContentProps) {
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadUserVotes();
    }
  }, [user]);

  const loadUserVotes = async () => {
    try {
      const response = await fetch("/api/votes/me");
      if (response.ok) {
        const data = await response.json();
        setUserVotes(data.votes || {});
      }
    } catch (error) {
      console.error("Erro ao carregar votos:", error);
    }
  };

  const handleVotesSaved = (votes: Record<string, string>) => {
    setUserVotes(votes);
  };

  return (
    <>
      <Header
        votingStatus={votingStatus}
        user={user}
        categories={categories}
        onVotesSaved={handleVotesSaved}
      />
      <div className="space-y-4">
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white border-4 border-black rounded-lg">
            Nenhuma categoria cadastrada ainda
          </div>
        )}
        <CategoryCardWrapper
          user={user}
          categories={categories}
          votingStatus={votingStatus}
          userVotes={userVotes}
          setUserVotes={setUserVotes}
        />
      </div>
    </>
  );
}
