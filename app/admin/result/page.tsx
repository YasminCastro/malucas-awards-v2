"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CategoryResult {
  categoryId: string;
  categoryName: string;
  results: Array<{
    participantInstagram: string;
    votes: number;
    voters: string[];
  }>;
  totalVotes: number;
}

interface UserVotes {
  [userInstagram: string]: Array<{
    categoryName: string;
    participantInstagram: string;
  }>;
}

// Componente de imagem com fallback
function ParticipantImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc("/cidf.png");
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

export default function AdminResultPage() {
  const router = useRouter();
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([]);
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const response = await fetch("/api/admin/results");
      if (response.status === 401 || response.status === 403) {
        router.push("/");
        return;
      }
      if (!response.ok) {
        throw new Error("Erro ao carregar resultados");
      }
      const data = await response.json();
      setCategoryResults(data.categoryResults || []);
      setUserVotes(data.userVotes || {});
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserImage = (instagram: string) => {
    const username = instagram.replace("@", "");
    return `/nominees/${username}.jpeg`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
                  Resultados
                </h1>
                <p className="text-black text-sm mt-1">
                  Visualização de resultados e votos
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Results Section */}
        <Card className="border-4 border-black mb-6">
          <CardHeader>
            <CardTitle>Resultados por Categoria</CardTitle>
            <CardDescription>Top 3 colocados em cada categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoryResults.map((category) => (
                <div
                  key={category.categoryId}
                  className="border-2 border-black rounded-lg p-4 bg-white"
                >
                  <h3 className="text-2xl font-bold text-black uppercase mb-4">
                    {category.categoryName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {category.results.map((result, index) => {
                      const position = index + 1;
                      const positionColors = [
                        "bg-yellow-400 border-yellow-600", // 1º lugar
                        "bg-gray-300 border-gray-500", // 2º lugar
                        "bg-orange-300 border-orange-500", // 3º lugar
                      ];
                      const positionLabels = ["🥇", "🥈", "🥉"];

                      return (
                        <div
                          key={result.participantInstagram}
                          className={`border-4 rounded-lg p-4 ${
                            positionColors[index] ||
                            "bg-gray-100 border-gray-400"
                          }`}
                        >
                          <div className="text-center mb-3">
                            <span className="text-4xl">
                              {positionLabels[index] || `${position}º`}
                            </span>
                            <p className="text-sm font-bold mt-1">
                              {position}º Lugar
                            </p>
                          </div>
                          <div className="relative w-full aspect-square mb-3 rounded-md overflow-hidden border-2 border-black">
                            <ParticipantImage
                              src={getUserImage(result.participantInstagram)}
                              alt={result.participantInstagram}
                              className="object-cover"
                            />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg">
                              {result.participantInstagram}
                            </p>
                            <p className="text-sm mt-1">
                              {result.votes} voto{result.votes !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {category.results.length === 0 && (
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        Nenhum voto registrado ainda
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {categoryResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma categoria encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Votes Section */}
        <Card className="border-4 border-black">
          <CardHeader>
            <CardTitle>Votos por Usuário</CardTitle>
            <CardDescription>
              Clique em um usuário para ver seus votos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.keys(userVotes).length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(userVotes).map(([userInstagram, votes]) => (
                    <AccordionItem
                      key={userInstagram}
                      value={userInstagram}
                      className="bg-white border-2 border-black rounded-lg px-4 mb-2 border-b-0"
                    >
                      <AccordionTrigger className="py-4 hover:no-underline [&>svg]:text-black">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 border-black">
                            <ParticipantImage
                              src={getUserImage(userInstagram)}
                              alt={userInstagram}
                              className="object-cover rounded-full"
                            />
                          </div>
                          <span className="font-bold text-black">
                            {userInstagram}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({votes.length} voto{votes.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {votes.map((vote, index) => (
                            <div
                              key={index}
                              className="border-2 border-gray-300 rounded-md overflow-hidden bg-gray-50"
                            >
                              <div className="p-3 border-b-2 border-gray-300">
                                <p className="font-bold text-sm text-black">
                                  {vote.categoryName}
                                </p>
                              </div>
                              <div className="relative w-full aspect-square">
                                <ParticipantImage
                                  src={getUserImage(vote.participantInstagram)}
                                  alt={vote.participantInstagram}
                                  className="object-cover"
                                />
                              </div>
                              <div className="p-2 border-t-2 border-gray-300">
                                <p className="text-black font-medium text-center text-xs">
                                  {vote.participantInstagram}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum voto registrado ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
