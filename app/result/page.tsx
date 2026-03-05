"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { ParticipantImage } from "@/components/participant-image";
import { ResultNavigation } from "@/components/result-navigation";
import { CategoriesResult } from "@/types/categories";
import { ResultTitle } from "@/components/result-title";
import { ResultFirstSlide } from "@/components/result-first-slide";
import { ResultSecondSlide } from "@/components/result-second-slide";
import { ResultThirdSlide } from "@/components/result-third-slide";



const POSITION_COLORS = [
  "bg-yellow-400 border-yellow-600",
  "bg-gray-300 border-gray-500",
  "bg-orange-300 border-orange-500",
];
const POSITION_LABELS = ["🥇", "🥈", "🥉"];

function getUserImage(instagram: string) {
  const username = instagram.replace("@", "");
  return `/nominees/${username}.jpeg`;
}

export default function ResultPage() {
  const router = useRouter();
  const [categoryResults, setCategoryResults] = useState<CategoriesResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/admin/results");
        if (response.status === 401 || response.status === 403) {
          router.push("/");
          return;
        }
        if (!response.ok) throw new Error("Erro ao carregar resultados");
        const data = await response.json();
        if (!cancelled) {
          setCategoryResults(data.categoryResults || []);
          setCurrentIndex(0);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao carregar resultados");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom_right,#f93fff,#f7f908)] flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom_right,#f93fff,#f7f908)] flex items-center justify-center p-4">
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-red-700 text-center max-w-md">
          {error}
        </div>
      </div>
    );
  }

  if (categoryResults.length === 0) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom_right,#f93fff,#f7f908)] flex items-center justify-center p-4">
        <p className="text-lg text-black/80">Nenhuma categoria encontrada.</p>
      </div>
    );
  }


  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(to_bottom_right,#f93fff,#f7f908)] flex flex-col">
      {/* Slide area */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-400 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {/* Slide 0: título da apresentação */}
            <ResultTitle />


            {/* Por categoria: 1º slide = concorrentes, 2º slide = grid, 3º slide = ganhadores (pódio) */}
            {categoryResults.map((cat, index) => {
              const concorrentes = cat.allResults ?? cat.results;
              const ganhadores = [...(concorrentes ?? [])]
                .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
                .slice(0, 3);
              return (
                <Fragment key={cat.categoryId}>
                  <ResultFirstSlide
                    categoryName={cat.categoryName}
                    participants={concorrentes}
                    isActive={currentIndex === 1 + index * 3}
                  />

                  <ResultSecondSlide
                    categoryName={cat.categoryName}
                    participants={concorrentes}
                    isActive={currentIndex === 2 + index * 3}
                  />

                  <ResultThirdSlide
                    categoryName={cat.categoryName}
                    results={ganhadores}
                    isActive={currentIndex === 3 + index * 3}
                  />
                </Fragment>
              );
            })}
          </div>
        </div>

        <ResultNavigation
          totalSlides={1 + categoryResults.length * 3}
          setCurrentIndex={setCurrentIndex}
          currentIndex={currentIndex}
        />
      </div>
    </div>
  );
}
