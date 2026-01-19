"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { useRouter } from "next/navigation";


interface AdminCardProps {
    title: string;
    description: string;
    path: string
}

export function AdminCard({
    title,
    description,
    path
}: AdminCardProps) {
    const router = useRouter();

    return (
        <Card className="border-4 border-black hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    className="w-full"
                    onClick={() => router.push(path)}
                >
                    Acessar
                </Button>
            </CardContent>
        </Card>
    );
}
