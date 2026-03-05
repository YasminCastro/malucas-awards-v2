"use client";

import { useEffect, useRef, useState } from "react";
import { ParticipantImage } from "./participant-image";
import BlurText from "./BlurText";
import AnimatedContent from './AnimatedContent'


interface IProps {
    categoryName: string
    participants: any[]
    isActive?: boolean
}

function getUserImage(instagram: string) {
    const username = instagram.replace("@", "");
    return `/nominees/${username}.jpeg`;
}


export function ResultFirstSlide({ categoryName, participants, isActive = false }: IProps) {
    const [blurKey, setBlurKey] = useState(0);
    const prevActive = useRef(false);

    useEffect(() => {
        if (isActive && !prevActive.current) setBlurKey((k) => k + 1);
        prevActive.current = isActive;
    }, [isActive]);

    return (
        <div className="w-full h-full shrink-0 flex flex-col items-center justify-start pt-6 px-6 pb-6 md:pt-10 md:px-10 md:pb-10 overflow-auto">
            <BlurText
                key={`${blurKey}-${categoryName}`}
                text={categoryName}
                delay={200}
                animateBy="words"
                direction="top"
                className="text-5xl mb-4 uppercase font-bold text-center"
                animationFrom={undefined}
                animationTo={undefined}
                onAnimationComplete={undefined}
            />
            <BlurText
                key={`${blurKey}-concorrentes`}
                text="Concorrentes que receberam votos"
                delay={200}
                animateBy="words"
                direction="top"
                className="mb-8 text-center"
                animationFrom={undefined}
                animationTo={undefined}
                onAnimationComplete={undefined}
            />

            <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...participants]
                    .sort((a, b) =>
                        (a.participantName ?? "").localeCompare(b.participantName ?? "", "pt-BR")
                    )
                    .map((result, index) => {
                        const animDuration = 1;
                        return (
                            <AnimatedContent
                                key={result.participantInstagram}
                                playWhen={isActive}
                                distance={100}
                                direction="vertical"
                                reverse={false}
                                duration={animDuration}
                                ease="power3.out"
                                initialOpacity={0}
                                animateOpacity
                                scale={1}
                                threshold={0.1}
                                delay={index * (animDuration / 2)}
                            >
                                <div
                                    className="border-2 border-black rounded-lg p-3 bg-white/90"
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
                            </AnimatedContent>
                        );
                    })}
            </div>
        </div>
    );
}
