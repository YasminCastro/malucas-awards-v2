"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ParticipantImage } from "./participant-image";
import BlurText from "./BlurText";
import AnimatedContent from "./AnimatedContent";

interface IProps {
    categoryName: string;
    participants: any[];
    isActive?: boolean;
}

function getUserImage(instagram: string) {
    const username = instagram.replace("@", "");
    return `/nominees/${username}.jpeg`;
}

const ENTRANCE_DURATION = 1;
const PAUSE_AFTER_ENTRANCE = 0.8; // segundos de pausa após o último card entrar
const SHRINK_DURATION_S = 0.35;

export function ResultSecondSlide({ categoryName, participants, isActive = false }: IProps) {
    const [blurKey, setBlurKey] = useState(0);
    const [phase, setPhase] = useState<"all" | "top3">("all");
    const [showTop3Subtitle, setShowTop3Subtitle] = useState(false);
    const [collapseHidden, setCollapseHidden] = useState(false); // após sumir, tira do layout para os 3 ficarem juntos
    const prevActive = useRef(false);

    const sortedByName = useMemo(
        () =>
            [...participants].sort((a, b) =>
                (a.participantName ?? "").localeCompare(b.participantName ?? "", "pt-BR")
            ),
        [participants]
    );

    const top3Instagram = useMemo(
        () =>
            new Set(
                [...participants]
                    .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
                    .slice(0, 3)
                    .map((p) => p.participantInstagram)
            ),
        [participants]
    );

    useEffect(() => {
        if (isActive && !prevActive.current) setBlurKey((k) => k + 1);
        prevActive.current = isActive;
    }, [isActive]);

    useEffect(() => {
        if (!isActive) {
            setPhase("all");
            setShowTop3Subtitle(false);
            setCollapseHidden(false);
            return;
        }
        setPhase("all");
        setCollapseHidden(false);
        const lastCardEnd =
            (sortedByName.length - 1) * (ENTRANCE_DURATION / 2) + ENTRANCE_DURATION + PAUSE_AFTER_ENTRANCE;
        const t1 = setTimeout(() => setPhase("top3"), lastCardEnd * 1000);
        const t2 = setTimeout(
            () => setCollapseHidden(true),
            (lastCardEnd + SHRINK_DURATION_S) * 1000
        );
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [isActive, sortedByName.length]);

    const shouldHide = phase === "top3";
    const removeFromLayout = shouldHide && collapseHidden;
    const isInTop3 = (instagram: string) => top3Instagram.has(instagram);

    return (
        <div className="w-full h-full shrink-0 flex flex-col items-center justify-start pt-6 px-6 pb-6 md:pt-10 md:px-10 md:pb-10 overflow-auto">
            <h2 className="text-5xl mb-4 uppercase font-bold text-center">{categoryName}</h2>

            <div className="mb-8 min-h-12 flex items-center justify-center text-center">
                {phase === "all" && (
                    <p className="text-lg">
                        Concorrentes que receberam votos
                    </p>
                )}
                {phase === "top3" && !showTop3Subtitle && (
                    <BlurText
                        key={`${blurKey}-concorrentes-erase`}
                        text="Concorrentes que receberam votos"
                        delay={80}
                        animateBy="words"
                        direction="top"
                        className=""
                        animationFrom={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                        animationTo={[
                            { filter: "blur(5px)", opacity: 0.5, y: 5 },
                            { filter: "blur(10px)", opacity: 0, y: 50 },
                        ]}
                        onAnimationComplete={() => setShowTop3Subtitle(true)}
                        stepDuration={0.25}
                    />
                )}
                {showTop3Subtitle && (
                    <BlurText
                        key={`${blurKey}-top3`}
                        text="Top 3"
                        delay={150}
                        animateBy="words"
                        direction="top"
                        className=""
                        animationFrom={{ filter: "blur(10px)", opacity: 0, y: 50 }}
                        animationTo={[
                            { filter: "blur(5px)", opacity: 0.5, y: 5 },
                            { filter: "blur(0px)", opacity: 1, y: 0 },
                        ]}
                        onAnimationComplete={undefined}
                        stepDuration={0.3}
                    />
                )}
            </div>

            <div
                className={`w-full max-w-4xl grid gap-4 ${collapseHidden ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                    }`}
            >
                {sortedByName.map((result, index) => {
                    const hideThis = shouldHide && !isInTop3(result.participantInstagram);
                    const outOfLayout = removeFromLayout && hideThis;
                    return (
                        <motion.div
                            key={result.participantInstagram ?? result.participantName ?? index}
                            layout
                            initial={false}
                            animate={{
                                opacity: hideThis ? 0 : 1,
                                scale: hideThis ? 0.7 : 1,
                                transition: {
                                    duration: SHRINK_DURATION_S,
                                    ease: [0.32, 0.72, 0, 1],
                                },
                            }}
                            style={
                                outOfLayout
                                    ? {
                                        position: "absolute",
                                        width: 0,
                                        height: 0,
                                        overflow: "hidden",
                                        margin: 0,
                                        padding: 0,
                                        pointerEvents: "none",
                                    }
                                    : undefined
                            }
                        >
                            <AnimatedContent
                                playWhen={isActive}
                                distance={100}
                                direction="vertical"
                                reverse={false}
                                duration={ENTRANCE_DURATION}
                                ease="power3.out"
                                initialOpacity={0}
                                animateOpacity
                                scale={1}
                                threshold={0.1}
                                delay={index * (ENTRANCE_DURATION / 2)}
                            >
                                <div className="border-2 border-black rounded-lg p-3 bg-white/90">
                                    <div className="relative w-full aspect-square mb-2 rounded-md overflow-hidden border-2 border-black">
                                        <ParticipantImage
                                            src={getUserImage(result.participantInstagram)}
                                            alt={result.participantInstagram}
                                            className="object-cover"
                                        />
                                    </div>
                                    <p
                                        className="font-bold text-sm text-center truncate"
                                        title={result.participantName || result.participantInstagram}
                                    >
                                        {result.participantName || result.participantInstagram}
                                    </p>
                                </div>
                            </AnimatedContent>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
