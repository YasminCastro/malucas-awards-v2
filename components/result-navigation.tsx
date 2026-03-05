"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";

interface ResultNavigationProps {
  totalSlides: number;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  currentIndex: number;
}

export function ResultNavigation({
  totalSlides,
  setCurrentIndex,
  currentIndex,
}: ResultNavigationProps) {
  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, [setCurrentIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(totalSlides - 1, i + 1));
  }, [setCurrentIndex, totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSlides - 1;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 md:px-6">
      <Button
        size="icon-lg"
        onClick={goPrev}
        disabled={isFirst}
        className="pointer-events-auto border-2 border-black rounded-full shrink-0 shadow-lg"
        aria-label="Categoria anterior"
      >
        <ChevronLeft className="size-8" />
      </Button>
      <Button
        size="icon-lg"
        onClick={goNext}
        disabled={isLast}
        className="pointer-events-auto border-2 border-black rounded-full shrink-0 shadow-lg"
        aria-label="Próxima categoria"
      >
        <ChevronRight className="size-8" />
      </Button>
    </div>
  );
}
