"use client";

import Image from "next/image";
import LightRays from './LightRays';

export function ResultTitle() {
    return (
        <div className="relative w-full h-full shrink-0 bg-black">
            <div className="absolute inset-0 z-30">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#ffffff"
                    raysSpeed={0.4}
                    lightSpread={1}
                    rayLength={3}
                    pulsating
                    fadeDistance={1}
                    saturation={1}
                    followMouse={false}
                    mouseInfluence={0.1}
                    noiseAmount={0}
                    distortion={0}
                />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 p-6 md:p-10">
                <div className="relative w-full max-w-xl aspect-square">
                    <Image
                        src="/logo-glitch.png"
                        alt="Malucas Awards"
                        width={400}
                        height={400}
                        className="w-full h-full object-contain relative z-0"
                        priority
                    />
                    <div
                        className="logo-glitch-layer logo-glitch-layer-1 absolute inset-0 z-1"
                        style={{ backgroundImage: "url(/logo-glitch.png)" }}
                        aria-hidden
                    />
                    <div
                        className="logo-glitch-layer logo-glitch-layer-2 absolute inset-0 z-1"
                        style={{ backgroundImage: "url(/logo-glitch.png)" }}
                        aria-hidden
                    />
                </div>
            </div>
        </div>
    );
}
