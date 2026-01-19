import { connectToDatabase } from "@/lib/db";
import { Collection } from "mongodb";

export interface Vote {
    _id?: string;
    userId: string;
    userInstagram: string;
    categoryId: string;
    categoryName: string;
    participantInstagram: string;
    createdAt: Date;
}

// Obter coleção de votos
async function getVotesCollection(): Promise<Collection<Vote>> {
    const { db } = await connectToDatabase();
    return db.collection<Vote>("votes");
}

// Salvar votos de um usuário
export async function saveVotes(
    userId: string,
    userInstagram: string,
    votes: Record<string, string>,
    categories: { _id: string; name: string }[]
): Promise<Vote[]> {
    const collection = await getVotesCollection();

    // Primeiro, remover votos anteriores do usuário
    await collection.deleteMany({ userId });

    // Criar novos votos
    const votesToInsert: Omit<Vote, "_id">[] = [];
    for (const [categoryId, participantInstagram] of Object.entries(votes)) {
        const category = categories.find((cat) => cat._id === categoryId);
        if (category) {
            votesToInsert.push({
                userId,
                userInstagram,
                categoryId,
                categoryName: category.name,
                participantInstagram,
                createdAt: new Date(),
            });
        }
    }

    if (votesToInsert.length > 0) {
        await collection.insertMany(votesToInsert as any);
    }

    // Retornar os votos inseridos
    const insertedVotes = await collection.find({ userId }).toArray();
    return insertedVotes;
}

// Buscar todos os votos
export async function getAllVotes(): Promise<Vote[]> {
    const collection = await getVotesCollection();
    return collection.find({}).sort({ createdAt: 1 }).toArray();
}

// Buscar votos de um usuário específico
export async function getVotesByUser(userId: string): Promise<Vote[]> {
    const collection = await getVotesCollection();
    return collection.find({ userId }).toArray();
}

// Buscar votos por categoria
export async function getVotesByCategory(categoryId: string | string[]): Promise<Vote[]> {
    const collection = await getVotesCollection();
    if (Array.isArray(categoryId)) {
        return collection.find({ categoryId: { $in: categoryId } }).toArray();
    }
    return collection.find({ categoryId }).toArray();
}

// Calcular resultados de uma categoria (contagem de votos)
export async function getCategoryResults(categoryId: string | string[]): Promise<
    Array<{
        participantInstagram: string;
        votes: number;
        voters: string[];
    }>
> {
    const votes = await getVotesByCategory(categoryId);

    // Agrupar votos por participante
    const voteCount: Record<string, { count: number; voters: string[] }> = {};

    for (const vote of votes) {
        if (!voteCount[vote.participantInstagram]) {
            voteCount[vote.participantInstagram] = {
                count: 0,
                voters: [],
            };
        }
        voteCount[vote.participantInstagram].count++;
        voteCount[vote.participantInstagram].voters.push(vote.userInstagram);
    }

    // Converter para array e ordenar por votos (decrescente)
    const results = Object.entries(voteCount)
        .map(([participantInstagram, data]) => ({
            participantInstagram,
            votes: data.count,
            voters: data.voters,
        }))
        .sort((a, b) => b.votes - a.votes);

    return results;
}
