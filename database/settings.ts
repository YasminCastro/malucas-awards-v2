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

export async function getSettings(): Promise<Settings | null> {
  try {
    const filePath = path.join(process.cwd(), "database", "settings.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const rawSettings = JSON.parse(fileContent) as any;

    if (!rawSettings) {
      return null;
    }

    return {
      status: rawSettings.status,
      eventDate: rawSettings.eventDate,
    };
  } catch (error: any) {
    console.error("Erro ao ler configurações:", error);
    return null;
  }
}
