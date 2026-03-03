import { promises as fs } from "fs";
import path from "path";

export interface Settings {
  status:
  | "escolhendo-categorias"
  | "pre-votacao"
  | "votacao"
  | "pos-votacao"
  | "resultado";
  eventDate?: string;
}

let settingsCache: Settings | null = null;

export async function getSettings(): Promise<Settings | null> {
  if (settingsCache) {
    return settingsCache;
  }

  try {
    const filePath = path.join(process.cwd(), "database", "settings.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const rawSettings = JSON.parse(fileContent) as any;

    if (!rawSettings) {
      return null;
    }

    settingsCache = {
      status: rawSettings.status,
      eventDate: rawSettings.eventDate
    };

    return settingsCache;
  } catch (error: any) {
    console.error("Erro ao ler configurações:", error);
    settingsCache = null;

    return null;
  }
}
