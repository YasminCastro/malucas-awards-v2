"use client";

import { Category } from "@/database/categories";
import { JWTPayload } from "@/lib/auth";
import { useEffect, useState } from "react";
import { VotingStatus } from "@/types/settings";
import { CategoryResult } from "@/types/categories";
import { CategoryCard } from "./category-card";

interface IProps {
    categories: Category[]
    user: JWTPayload | null
    votingStatus: VotingStatus
}

export function CategoryCardWrapper({ categories, user, votingStatus }: IProps) {
    const [userVotes, setUserVotes] = useState<Record<string, string>>({});
    const [categoriesResults, setCategoriesResults] = useState<Record<string, CategoryResult[]>>({});

    useEffect(() => {
        if (user) {
            loadUserVotes();
        }

        if (votingStatus === "resultado") {
            loadResults();
        }
    }, []);

    const loadResults = async () => {
        try {
            const response = await fetch(`/api/results`);
            if (response.ok) {
                const data = await response.json();
                setCategoriesResults(data);
            }
        } catch (error) {
            console.error("Erro ao carregar resultados:", error);
        }
    };

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


    return (
        <>
            {categories.map((category) => {
                const categoryResult = categoriesResults[category._id]
                return <CategoryCard user={user} key={category._id} category={category} votingStatus={votingStatus} userVotes={userVotes} setUserVotes={setUserVotes} categoryResult={categoryResult} />

            })}
        </>
    );
}
