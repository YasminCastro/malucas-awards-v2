"use client";

import { useEffect, useRef, useState } from "react";
import { ParticipantImage } from "./participant-image";
import BlurText from "./BlurText";


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
                key={blurKey}
                text={categoryName}
                delay={200}
                animateBy="words"
                direction="top"
                className="text-5xl mb-8 uppercase font-bold text-center"
                animationFrom={undefined}
                animationTo={undefined}
                onAnimationComplete={undefined}
            />

            <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {participants.map((result) => (
                    <div
                        key={result.participantInstagram}
                        className="border-2 border-black rounded-lg p-3 bg-white/90"
                    >
                        <div className="relative w-full aspect-square mb-2 rounded-md overflow-hidden border-2 border-black">
                            <ParticipantImage
                                src={getUserImage(result.participantInstagram)}
                                alt={result.participantInstagram}
                                className="object-cover"
                            />
                        </div>
                        <p className="font-bold text-sm text-center truncate" title={result.participantInstagram}>
                            {result.participantInstagram}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
