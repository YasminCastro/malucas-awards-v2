"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogoutButton } from "./logout-button";
import Image from "next/image";


interface AdminCardProps {
    title: string;
    description: string;
}

export function AdminHeader({
    title,
    description,
}: AdminCardProps) {
    const router = useRouter();

    return (
        <div className="bg-white border-4 border-black rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                        <h1 className="text-4xl font-bold text-black uppercase tracking-tight">
                            {title}
                        </h1>
                        <p className="text-black text-sm mt-1">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/admin")}
                        className="h-12 px-6"
                    >
                        Voltar ao Painel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => (window.location.href = "/")}
                        className="h-12 px-6"
                    >
                        Início
                    </Button>
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
