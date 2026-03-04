import { connectToDatabase } from "@/lib/db";
import { CategoryResult } from "@/types/categories";
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
export async function getOneCategoryResults(categoryId: string | string[]): Promise<
    Array<CategoryResult>
> {
    const collection = await getVotesCollection();

    const pipeline = [
        {
            $match: {
                categoryId: Array.isArray(categoryId)
                    ? { $in: categoryId }
                    : categoryId,
            },
        },
        {
            $group: {
                _id: "$participantInstagram",
                votes: { $sum: 1 },
                voters: { $push: "$userInstagram" },
            },
        },
        {
            $project: {
                _id: 0,
                participantInstagram: "$_id",
                votes: 1,
                voters: 1,
            },
        },
        {
            $lookup: {
                from: "users",
                let: { participantIG: "$participantInstagram" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$instagram",
                                    {
                                        $toLower: {
                                            $replaceAll: {
                                                input: "$$participantIG",
                                                find: "@",
                                                replacement: "",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    { $project: { _id: 0, name: 1 } },
                ],
                as: "userInfo",
            },
        },
        {
            $addFields: {
                participantName: { $arrayElemAt: ["$userInfo.name", 0] },
            },
        },
        {
            $project: { userInfo: 0 },
        },
        {
            $sort: { votes: -1 },
        },
        {
            $setWindowFields: {
                sortBy: { votes: -1 },
                output: {
                    position: { $rank: {} },
                },
            },
        },
        {
            $addFields: {
                image: {
                    $concat: [
                        {
                            $replaceAll: {
                                input: "$participantInstagram",
                                find: "@",
                                replacement: "",
                            },
                        },
                        ".jpeg",
                    ],
                },
            },
        },];

    return collection.aggregate(pipeline).toArray() as any;
}

export async function getAllCategoriesResults(): Promise<Record<string, CategoryResult[]>> {
    const collection = await getVotesCollection();

    const pipeline = [
        // 1. Agrupa por categoria + participante
        {
            $group: {
                _id: {
                    categoryId: "$categoryId",
                    participantInstagram: "$participantInstagram",
                },
                votes: { $sum: 1 },
                voters: { $push: "$userInstagram" },
            },
        },
        // 2. Projeta para achatar os campos
        {
            $project: {
                _id: 0,
                categoryId: "$_id.categoryId",
                participantInstagram: "$_id.participantInstagram",
                votes: 1,
                voters: 1,
            },
        },
        // 3. Lookup para buscar o nome do participante na coleção users
        {
            $lookup: {
                from: "users",
                let: { participantIG: "$participantInstagram" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$instagram",
                                    {
                                        $toLower: {
                                            $replaceAll: {
                                                input: "$$participantIG",
                                                find: "@",
                                                replacement: "",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    { $project: { _id: 0, name: 1 } },
                ],
                as: "userInfo",
            },
        },
        {
            $addFields: {
                participantName: { $arrayElemAt: ["$userInfo.name", 0] },
                image: {
                    $concat: [
                        {
                            $replaceAll: {
                                input: "$participantInstagram",
                                find: "@",
                                replacement: "",
                            },
                        },
                        ".jpeg",
                    ],
                },
            },
        },
        { $project: { userInfo: 0 } },
        // 4. Ordena por votos dentro de cada categoria
        { $sort: { categoryId: 1, votes: -1 } },
        // 5. Calcula o rank separado POR categoria
        {
            $setWindowFields: {
                partitionBy: "$categoryId",
                sortBy: { votes: -1 },
                output: {
                    position: { $rank: {} },
                },
            },
        },
        // 6. Agrupa de volta, criando um array de participantes por categoria
        {
            $group: {
                _id: "$categoryId",
                participants: {
                    $push: {
                        participantInstagram: "$participantInstagram",
                        participantName: "$participantName",
                        votes: "$votes",
                        voters: "$voters",
                        position: "$position",
                        image: "$image",
                    },
                },
            },
        },
    ];

    const raw = await collection.aggregate(pipeline).toArray();

    return Object.fromEntries(raw.map((item) => [item._id, item.participants]));
}
