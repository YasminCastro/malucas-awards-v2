"use client";

import { Category } from "@/database/categories";
import { JWTPayload } from "@/lib/auth";
import { useEffect, useState } from "react";
import { VotingStatus } from "@/types/settings";
import { CategoryResult } from "@/types/categories";
import { CategoryCard } from "./category-card";
import { Dispatch, SetStateAction } from "react";

interface IProps {
    categories: Category[]
    user: JWTPayload | null
    votingStatus: VotingStatus
    userVotes?: Record<string, string>
    setUserVotes?: Dispatch<SetStateAction<Record<string, string>>>
}

export function CategoryCardWrapper({ categories, user, votingStatus, userVotes: userVotesProp, setUserVotes: setUserVotesProp }: IProps) {
    const [internalUserVotes, setInternalUserVotes] = useState<Record<string, string>>({});
    const [categoriesResults, setCategoriesResults] = useState<Record<string, CategoryResult[]>>({});

    const userVotes = userVotesProp ?? internalUserVotes;
    const setUserVotes = setUserVotesProp ?? setInternalUserVotes;

    useEffect(() => {
        if (votingStatus === "resultado") {
            loadResults();
        }
    }, [votingStatus]);

    useEffect(() => {
        if (user && !setUserVotesProp) {
            loadUserVotes();
        }
    }, [user]);

    const loadUserVotes = async () => {
        try {
            const response = await fetch("/api/votes/me");
            if (response.ok) {
                const data = await response.json();
                setInternalUserVotes(data.votes || {});
            }
        } catch (error) {
            console.error("Erro ao carregar votos:", error);
        }
    };

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


    return (
        <>
            {categories.map((category) => {
                const categoryResult = categoriesResults[category._id]
                return <CategoryCard user={user} key={category._id} category={category} votingStatus={votingStatus} userVotes={userVotes} setUserVotes={setUserVotes} categoryResult={categoryResult} />

            })}
        </>
    );
}
