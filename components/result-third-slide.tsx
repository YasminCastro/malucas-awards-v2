"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ParticipantImage } from "./participant-image";
import type { CategoryResult } from "@/types/categories";

interface IProps {
    categoryName: string
    results: CategoryResult[]
    isActive?: boolean
}

function getUserImage(instagram: string) {
    const username = instagram.replace("@", "");
    return `/nominees/${username}.jpeg`;
}

const CORNER_PADDING = 24;
const CORNER_SCALE = 0.35;
const MIN_SCALE = 0.2;

function getThirdVotesResult(results: CategoryResult[]): CategoryResult | null {
    if (!results.length) return null;
    return [...results].sort((a, b) => (a.votes ?? 0) - (b.votes ?? 0))[0] ?? null;
}

function getSecondVotesResult(results: CategoryResult[]): CategoryResult | null {
    if (results.length < 2) return null;
    return [...results].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))[1] ?? null;
}

function getFirstVotesResult(results: CategoryResult[]): CategoryResult | null {
    if (!results.length) return null;
    return [...results].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))[0] ?? null;
}

export function ResultThirdSlide({ categoryName, results, isActive = false }: IProps) {
    const [blurKey, setBlurKey] = useState(0);
    const [showCenterCard, setShowCenterCard] = useState(false);
    const [showSecondInCenter, setShowSecondInCenter] = useState(false);
    const [showFirstInCenter, setShowFirstInCenter] = useState(false);
    const [cornerCardHidden, setCornerCardHidden] = useState(false);
    const [cornerSecondHidden, setCornerSecondHidden] = useState(false);
    const [cornerFirstHidden, setCornerFirstHidden] = useState(false);
    const prevActive = useRef(false);
    const slideRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const centerCardRef = useRef<HTMLDivElement>(null);
    const centerSecondCardRef = useRef<HTMLDivElement>(null);
    const centerFirstCardRef = useRef<HTMLDivElement>(null);
    const cornerCardRef = useRef<HTMLDivElement>(null);
    const cornerSecondRef = useRef<HTMLDivElement>(null);
    const cornerFirstRef = useRef<HTMLDivElement>(null);
    const stillActiveRef = useRef(isActive);
    const secondSequenceStartedRef = useRef(false);
    const firstSequenceStartedRef = useRef(false);

    const thirdVotesResult = getThirdVotesResult(results);
    const secondVotesResult = getSecondVotesResult(results);
    const firstVotesResult = getFirstVotesResult(results);

    useEffect(() => {
        stillActiveRef.current = isActive;
        if (isActive && !prevActive.current) setBlurKey((k) => k + 1);
        prevActive.current = isActive;
        if (!isActive) {
            setShowCenterCard(false);
            setShowSecondInCenter(false);
            setShowFirstInCenter(false);
            setCornerCardHidden(false);
            setCornerSecondHidden(false);
            setCornerFirstHidden(false);
            secondSequenceStartedRef.current = false;
            firstSequenceStartedRef.current = false;
        }
    }, [isActive]);

    useEffect(() => {
        const slide = slideRef.current;
        const cards = cardsRef.current;
        if (!slide || !cards) return;

        if (!isActive) {
            const inner = cards.firstElementChild as HTMLElement;
            gsap.set(cards, { clearProps: "all" });
            if (inner) gsap.set(inner, { clearProps: "all" });
            return;
        }

        const tween = gsap.delayedCall(1, () => {
            const slideRect = slide.getBoundingClientRect();
            const cardsRect = cards.getBoundingClientRect();
            const maxW = slideRect.width - CORNER_PADDING * 2;
            const maxH = slideRect.height - CORNER_PADDING * 2;
            const scale = Math.max(MIN_SCALE, Math.min(CORNER_SCALE, maxW / cardsRect.width, maxH / cardsRect.height));
            const endW = cardsRect.width * scale;
            const endH = cardsRect.height * scale;
            const endX = Math.max(0, slideRect.width - CORNER_PADDING - endW);
            const endY = Math.max(0, slideRect.height - CORNER_PADDING - endH);

            const startLeft = cardsRect.left - slideRect.left;
            const startTop = cardsRect.top - slideRect.top;
            const inner = cards.firstElementChild as HTMLElement;

            gsap.set(cards, {
                position: "absolute",
                left: startLeft,
                top: startTop,
                width: cardsRect.width,
                height: cardsRect.height,
                overflow: "hidden",
            });
            if (inner) gsap.set(inner, { width: cardsRect.width, height: cardsRect.height, transformOrigin: "0 0" });

            gsap.to(cards, {
                left: endX,
                top: endY,
                width: endW,
                height: endH,
                duration: 0.6,
                ease: "power2.inOut",
                overwrite: true,
            });
            if (inner) {
                gsap.to(inner, {
                    scale,
                    duration: 0.6,
                    ease: "power2.inOut",
                    overwrite: true,
                    onComplete: () => {
                        // Primeiro: fade suave do card no canto
                        const cornerEl = cornerCardRef.current;
                        if (cornerEl) {
                            gsap.to(cornerEl, {
                                opacity: 0,
                                duration: 0.6,
                                ease: "power2.inOut",
                                onComplete: () => {
                                    setCornerCardHidden(true);
                                    // 1 segundo depois: exibe o card grande no centro
                                    gsap.delayedCall(0.5, () => {
                                        if (stillActiveRef.current) setShowCenterCard(true);
                                    });
                                },
                            });
                        } else {
                            setCornerCardHidden(true);
                            gsap.delayedCall(0.5, () => {
                                if (stillActiveRef.current) setShowCenterCard(true);
                            });
                        }
                    },
                });
            } else {
                setCornerCardHidden(true);
                gsap.delayedCall(0.5, () => {
                    if (stillActiveRef.current) setShowCenterCard(true);
                });
            }
        });

        return () => {
            tween.kill();
        };
    }, [isActive]);

    useEffect(() => {
        if (!showCenterCard || !thirdVotesResult) return;
        const el = centerCardRef.current;
        if (!el) return;
        gsap.fromTo(
            el,
            { scale: 0.3, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
        );
    }, [showCenterCard, thirdVotesResult]);

    // Quando o 3º aparece no centro: fade do 2º no canto, depois 1s exibe 2º ao lado do 3º
    useEffect(() => {
        if (!showCenterCard || !secondVotesResult || secondSequenceStartedRef.current) return;
        secondSequenceStartedRef.current = true;
        const cornerEl = cornerSecondRef.current;
        if (cornerEl) {
            gsap.to(cornerEl, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    setCornerSecondHidden(true);
                    gsap.delayedCall(0.5, () => {
                        if (stillActiveRef.current) setShowSecondInCenter(true);
                    });
                },
            });
        } else {
            setCornerSecondHidden(true);
            gsap.delayedCall(0.5, () => {
                if (stillActiveRef.current) setShowSecondInCenter(true);
            });
        }
    }, [showCenterCard, secondVotesResult]);

    useEffect(() => {
        if (!showSecondInCenter || !secondVotesResult) return;
        const el = centerSecondCardRef.current;
        if (!el) return;
        gsap.fromTo(
            el,
            { scale: 0.3, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
        );
    }, [showSecondInCenter, secondVotesResult]);

    // Quando o 2º aparece no centro: fade do 1º no canto, depois 1s exibe 1º ao lado
    useEffect(() => {
        if (!showSecondInCenter || !firstVotesResult || firstSequenceStartedRef.current) return;
        firstSequenceStartedRef.current = true;
        const cornerEl = cornerFirstRef.current;
        if (cornerEl) {
            gsap.to(cornerEl, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    setCornerFirstHidden(true);
                    gsap.delayedCall(0.5, () => {
                        if (stillActiveRef.current) setShowFirstInCenter(true);
                    });
                },
            });
        } else {
            setCornerFirstHidden(true);
            gsap.delayedCall(0.5, () => {
                if (stillActiveRef.current) setShowFirstInCenter(true);
            });
        }
    }, [showSecondInCenter, firstVotesResult]);

    useEffect(() => {
        if (!showFirstInCenter || !firstVotesResult) return;
        const el = centerFirstCardRef.current;
        if (!el) return;
        gsap.fromTo(
            el,
            { scale: 0.3, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
        );
    }, [showFirstInCenter, firstVotesResult]);

    return (
        <div ref={slideRef} className="w-full h-full min-h-0 shrink-0 relative flex flex-col items-center justify-start pt-6 px-6 pb-6 md:pt-10 md:px-10 md:pb-10 overflow-hidden">
            <h2 className="text-5xl mb-4 uppercase font-bold text-center">{categoryName}</h2>
            {showCenterCard && thirdVotesResult && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-6 px-6 pb-6 md:pt-10 md:px-10 md:pb-10">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div
                            ref={centerCardRef}
                            className="w-full max-w-40 border-2 border-black rounded-lg p-3 bg-white/95 shadow-xl relative"
                            style={{ boxShadow: "0 0 0 1px black, 0 0 30px 8px rgba(249, 115, 22, 0.6), 0 0 50px 15px rgba(249, 115, 22, 0.3)" }}
                        >
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-orange-300 border-2 border-orange-500 text-black font-bold text-xs whitespace-nowrap shadow">
                                🥉 3º
                            </div>
                            <div className="relative w-full aspect-square mb-2 rounded-md overflow-hidden border-2 border-black mt-1">
                                <ParticipantImage
                                    src={getUserImage(thirdVotesResult.participantInstagram)}
                                    alt={thirdVotesResult.participantInstagram}
                                    className="object-cover"
                                />
                            </div>
                            <p className="font-bold text-sm text-center truncate" title={thirdVotesResult.participantName || thirdVotesResult.participantInstagram}>
                                {thirdVotesResult.participantName || thirdVotesResult.participantInstagram}
                            </p>
                            <p className="text-xs text-center text-black/70 mt-0.5">
                                {thirdVotesResult.votes ?? 0} voto{(thirdVotesResult.votes ?? 0) !== 1 ? "s" : ""}
                            </p>
                        </div>
                        {showFirstInCenter && firstVotesResult && (
                            <div
                                ref={centerFirstCardRef}
                                className="w-full max-w-72 border-2 border-black rounded-lg p-4 bg-white/95 shadow-xl relative"
                                style={{ boxShadow: "0 0 0 1px black, 0 0 35px 10px rgba(234, 179, 8, 0.6), 0 0 60px 20px rgba(234, 179, 8, 0.35)" }}
                            >
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-yellow-400 border-2 border-yellow-600 text-black font-bold text-sm whitespace-nowrap shadow">
                                    🥇 1º
                                </div>
                                <div className="relative w-full aspect-square mb-3 rounded-md overflow-hidden border-2 border-black mt-2">
                                    <ParticipantImage
                                        src={getUserImage(firstVotesResult.participantInstagram)}
                                        alt={firstVotesResult.participantInstagram}
                                        className="object-cover"
                                    />
                                </div>
                                <p className="font-bold text-lg text-center truncate" title={firstVotesResult.participantName || firstVotesResult.participantInstagram}>
                                    {firstVotesResult.participantName || firstVotesResult.participantInstagram}
                                </p>
                                <p className="text-sm text-center text-black/70 mt-1">
                                    {firstVotesResult.votes ?? 0} voto{(firstVotesResult.votes ?? 0) !== 1 ? "s" : ""}
                                </p>
                            </div>
                        )}
                        {showSecondInCenter && secondVotesResult && (
                            <div
                                ref={centerSecondCardRef}
                                className="w-full max-w-56 border-2 border-black rounded-lg p-3.5 bg-white/95 shadow-xl relative"
                                style={{ boxShadow: "0 0 0 1px black, 0 0 30px 8px rgba(156, 163, 175, 0.6), 0 0 50px 15px rgba(156, 163, 175, 0.3)" }}
                            >
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gray-300 border-2 border-gray-500 text-black font-bold text-xs whitespace-nowrap shadow">
                                    🥈 2º
                                </div>
                                <div className="relative w-full aspect-square mb-2.5 rounded-md overflow-hidden border-2 border-black mt-1.5">
                                    <ParticipantImage
                                        src={getUserImage(secondVotesResult.participantInstagram)}
                                        alt={secondVotesResult.participantInstagram}
                                        className="object-cover"
                                    />
                                </div>
                                <p className="font-bold text-base text-center truncate" title={secondVotesResult.participantName || secondVotesResult.participantInstagram}>
                                    {secondVotesResult.participantName || secondVotesResult.participantInstagram}
                                </p>
                                <p className="text-xs text-center text-black/70 mt-0.5">
                                    {secondVotesResult.votes ?? 0} voto{(secondVotesResult.votes ?? 0) !== 1 ? "s" : ""}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div ref={cardsRef} className="w-full max-w-4xl">
                <div className="grid grid-cols-3 gap-4 w-full h-full">
                    {[...results]
                        .sort((a, b) =>
                            (a.participantName ?? "").localeCompare(b.participantName ?? "", "pt-BR")
                        )
                        .filter((r) => {
                            if (cornerCardHidden && r.participantInstagram === thirdVotesResult?.participantInstagram) return false;
                            if (cornerSecondHidden && r.participantInstagram === secondVotesResult?.participantInstagram) return false;
                            if (cornerFirstHidden && r.participantInstagram === firstVotesResult?.participantInstagram) return false;
                            return true;
                        })
                        .map((result) => (
                            <div
                                ref={
                                    result.participantInstagram === thirdVotesResult?.participantInstagram
                                        ? cornerCardRef
                                        : result.participantInstagram === secondVotesResult?.participantInstagram
                                            ? cornerSecondRef
                                            : result.participantInstagram === firstVotesResult?.participantInstagram
                                                ? cornerFirstRef
                                                : undefined
                                }
                                className="border-2 border-black rounded-lg p-3 bg-white/90"
                                key={result.participantInstagram}
                            >
                                <div className="relative w-full aspect-square mb-2 rounded-md overflow-hidden border-2 border-black">
                                    <ParticipantImage
                                        src={getUserImage(result.participantInstagram)}
                                        alt={result.participantInstagram}
                                        className="object-cover"
                                    />
                                </div>
                                <p className="font-bold text-sm text-center truncate" title={result.participantName || result.participantInstagram}>
                                    {result.participantName || result.participantInstagram}
                                </p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
