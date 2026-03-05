"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ParticipantImage } from "./participant-image";

interface IProps {
    categoryName: string
    results: any[]
    isActive?: boolean
}

function getUserImage(instagram: string) {
    const username = instagram.replace("@", "");
    return `/nominees/${username}.jpeg`;
}


const POSITION_COLORS = [
    "bg-yellow-400 border-yellow-600",
    "bg-gray-300 border-gray-500",
    "bg-orange-300 border-orange-500",
];
const POSITION_LABELS = ["🥇", "🥈", "🥉"];

const CORNER_PADDING = 24;
const CORNER_SCALE = 0.35;
const MIN_SCALE = 0.2;

export function ResultThirdSlide({ categoryName, results, isActive = false }: IProps) {
    const [blurKey, setBlurKey] = useState(0);
    const prevActive = useRef(false);
    const slideRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isActive && !prevActive.current) setBlurKey((k) => k + 1);
        prevActive.current = isActive;
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

        const tween = gsap.delayedCall(2, () => {
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
                });
            }
        });

        return () => {
            tween.kill();
        };
    }, [isActive]);

    return (
        <div ref={slideRef} className="w-full h-full min-h-0 shrink-0 relative flex flex-col items-center justify-start pt-6 px-6 pb-6 md:pt-10 md:px-10 md:pb-10 overflow-hidden">
            <h2 className="text-5xl mb-4 uppercase font-bold text-center">{categoryName}</h2>

            <p className="text-lg text-black/80 mb-8 text-center">Ganhadores</p>
            <div ref={cardsRef} className="w-full max-w-4xl">
                <div className="grid grid-cols-3 gap-4 w-full h-full">
                    {[...results]
                        .sort((a, b) =>
                            (a.participantName ?? "").localeCompare(b.participantName ?? "", "pt-BR")
                        ).map((result) => (
                            <div
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
