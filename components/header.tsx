"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VotingStatus } from "@/types/settings";
import { JWTPayload } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { VotingSection } from "./voting-section";
import { Category } from "@/database/categories";

interface Header {
    votingStatus: VotingStatus;
    user?: JWTPayload | null;
    categories: Category[];
    onVotesSaved?: (votes: Record<string, string>) => void;
}

export function Header({ votingStatus, user, categories, onVotesSaved }: Header) {
    const getStatusMessage = () => {
        switch (votingStatus) {
            case "pre-votacao":
                return "A votação irá abrir em breve!";
            case "pos-votacao":
                return "Resultado disponível na premiação Malucas Awards";
            case "resultado":
                return null;
            default:
                return null;
        }
    };
    return (
        <div className="bg-white border-4 border-black rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 shrink-0">
                        <Image
                            src="/logo.png"
                            alt="Malucas Awards Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-black uppercase tracking-tight max-sm:text-2xl">
                            MALUCAS AWARDS 2026
                        </h1>
                        <p className="text-black text-sm mt-1">
                            Premiação anual dos melhores momentos.
                        </p>
                        {user && (
                            <p className="text-black text-sm mt-1">
                                Bem-vindo,{" "}
                                <span className="font-bold">@{user.instagram}</span>
                            </p>
                        )}
                    </div>
                </div>
                {votingStatus === "votacao" && !user && (
                    <Link href="/login">
                        <Button className="bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 px-8 rounded-md border-2 border-black">
                            Entrar
                        </Button>
                    </Link>
                )}

                {user && (
                    <div className="flex gap-2">
                        {user.isAdmin && (
                            <Button
                                variant="outline"
                                onClick={() => (window.location.href = "/admin")}
                                className="bg-white border-2 border-black text-black hover:bg-gray-100 font-bold uppercase h-12 px-6 rounded-md"
                            >
                                Admin
                            </Button>
                        )}
                        <LogoutButton />
                    </div>
                )}
            </div>
            {votingStatus === "votacao" && user && (
                <VotingSection categories={categories} onVotesSaved={onVotesSaved} />
            )}

            {user && getStatusMessage() && (
                <div className="border-t-4 border-black pt-4">
                    <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 text-center">
                        <p className="font-bold text-yellow-800 text-lg">
                            {getStatusMessage()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
