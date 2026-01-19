import { cache, CacheKeys } from "@/lib/cache";
import { promises as fs } from "fs";
import path from "path";

export interface Settings {
    _id?: string;
    status: "escolhendo-categorias" | "pre-votacao" | "votacao" | "pos-votacao" | "resultado";
    eventDate?: Date | string;
    updatedAt?: Date;
}

// Caminho do arquivo de configurações
function getSettingsFilePath(): string {
    return path.join(process.cwd(), "data", "settings.json");
}

// Buscar configurações do arquivo JSON
export async function getSettings(): Promise<Settings | null> {
    // Verificar cache
    const cached = cache.get<Settings | null>(CacheKeys.SETTINGS);
    if (cached !== null) {
        return cached;
    }

    try {
        const filePath = getSettingsFilePath();
        const fileContent = await fs.readFile(filePath, "utf-8");
        const rawSettings = JSON.parse(fileContent) as any;

        // Converter null para undefined e strings para Date quando necessário
        const settings: Settings = {
            ...rawSettings,
            eventDate: rawSettings.eventDate === null
                ? undefined
                : rawSettings.eventDate && typeof rawSettings.eventDate === "string"
                    ? new Date(rawSettings.eventDate)
                    : rawSettings.eventDate,
            updatedAt: rawSettings.updatedAt === null
                ? undefined
                : rawSettings.updatedAt && typeof rawSettings.updatedAt === "string"
                    ? new Date(rawSettings.updatedAt)
                    : rawSettings.updatedAt,
        };

        const result = settings || null;

        // Armazenar no cache por 1 minuto
        cache.set(CacheKeys.SETTINGS, result, 60 * 1000);

        return result;
    } catch (error: any) {
        // Se o arquivo não existir, retornar null (valores padrão serão usados)
        if (error.code === "ENOENT") {
            const result = null;
            cache.set(CacheKeys.SETTINGS, result, 60 * 1000);
            return result;
        }
        console.error("Erro ao ler configurações:", error);
        throw new Error("Erro ao ler configurações do arquivo");
    }
}

// Atualizar configurações no arquivo JSON
export async function updateSettings(
    updates: Partial<Pick<Settings, "status" | "eventDate">>
): Promise<Settings> {
    try {
        const filePath = getSettingsFilePath();

        // Ler configurações atuais
        let currentSettings: Settings;
        try {
            const fileContent = await fs.readFile(filePath, "utf-8");
            currentSettings = JSON.parse(fileContent) as Settings;
        } catch (error: any) {
            // Se o arquivo não existir, criar com valores padrão
            if (error.code === "ENOENT") {
                currentSettings = {
                    status: "escolhendo-categorias",
                };
            } else {
                throw error;
            }
        }

        // Atualizar campos
        const updateData: Settings = {
            ...currentSettings,
            updatedAt: new Date(),
        };

        if (updates.status !== undefined) {
            updateData.status = updates.status;
        }

        if (updates.eventDate !== undefined) {
            // Armazenar como string ISO no JSON
            updateData.eventDate = updates.eventDate
                ? (updates.eventDate instanceof Date
                    ? updates.eventDate.toISOString()
                    : updates.eventDate)
                : undefined;
        }

        // Garantir que o diretório existe
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });

        // Preparar dados para JSON (converter undefined para null, pois JSON não suporta undefined)
        const jsonData = {
            ...updateData,
            eventDate: updateData.eventDate === undefined ? null : updateData.eventDate,
            updatedAt: updateData.updatedAt ? updateData.updatedAt.toISOString() : null,
        };

        // Escrever no arquivo
        await fs.writeFile(
            filePath,
            JSON.stringify(jsonData, null, 2),
            "utf-8"
        );

        // Converter de volta para o formato esperado (Date objects)
        // Note: updateData ainda tem os valores originais em memória (não foram convertidos pelo JSON.stringify)
        const result: Settings = {
            ...updateData,
            eventDate: updateData.eventDate
                ? (typeof updateData.eventDate === "string"
                    ? new Date(updateData.eventDate)
                    : updateData.eventDate instanceof Date
                        ? updateData.eventDate
                        : new Date(updateData.eventDate))
                : undefined,
            updatedAt: updateData.updatedAt instanceof Date
                ? updateData.updatedAt
                : new Date(),
        };

        // Invalidar cache de configurações
        cache.delete(CacheKeys.SETTINGS);

        return result;
    } catch (error: any) {
        console.error("Erro ao atualizar configurações:", error);
        throw new Error("Erro ao atualizar configurações no arquivo");
    }
}
