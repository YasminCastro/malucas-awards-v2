export interface CategoryResult {
    participantInstagram: string;
    votes: number;
    voters: string[];
    position: number;
    image: string;
    participantName: string
}

export interface CategoriesResult {
    categoryId: string;
    categoryName: string;
    results: CategoryResult[];
    /** Todos os concorrentes que tiveram votos (para slide de apresentação) */
    allResults?: CategoryResult[];
    totalVotes: number;
}

