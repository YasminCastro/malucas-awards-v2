"use client";

import { useEffect, useRef, useState } from "react";
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


export function ResultThirdSlide({ categoryName, results, isActive = false }: IProps) {
    const [blurKey, setBlurKey] = useState(0);
    const prevActive = useRef(false);

    useEffect(() => {
        if (isActive && !prevActive.current) setBlurKey((k) => k + 1);
        prevActive.current = isActive;
    }, [isActive]);

    return (
        <div className="w-full h-full shrink-0 flex flex-col items-center justify-center p-6 md:p-10">
            <h2 className="text-3xl md:text-4xl font-bold text-black uppercase mb-8 text-center">
                {categoryName}
            </h2>
            <p className="text-lg text-black/80 mb-6 text-center">Ganhadores</p>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.map((result, index) => (
                    <div
                        key={result.participantInstagram}
                        className={`border-4 rounded-lg p-4 md:p-6 ${POSITION_COLORS[index] ?? "bg-gray-100 border-gray-400"
                            }`}
                    >
                        <div className="text-center mb-3">
                            <span className="text-4xl">
                                {POSITION_LABELS[index] ?? `${index + 1}º`}
                            </span>
                            <p className="text-sm font-bold mt-1">
                                {index + 1}º Lugar
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
                                {result.votes} voto
                                {result.votes !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
