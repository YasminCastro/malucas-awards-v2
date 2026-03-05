import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * @typedef {Object} AnimatedContentProps
 * @property {React.ReactNode} children
 * @property {Element | string | null} [container]
 * @property {boolean} [playWhen] When true, animation plays when slide is active (no ScrollTrigger).
 * @property {number} [distance]
 * @property {string} [direction]
 * @property {boolean} [reverse]
 * @property {number} [duration]
 * @property {string} [ease]
 * @property {number} [initialOpacity]
 * @property {boolean} [animateOpacity]
 * @property {number} [scale]
 * @property {number} [threshold]
 * @property {number} [delay]
 * @property {number} [disappearAfter]
 * @property {number} [disappearDuration]
 * @property {string} [disappearEase]
 * @property {() => void} [onComplete]
 * @property {() => void} [onDisappearanceComplete]
 * @property {string} [className]
 */

/** @param {AnimatedContentProps} props */
const AnimatedContent = ({
  children,
  container = undefined,
  playWhen = undefined,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power3.in',
  onComplete = undefined,
  onDisappearanceComplete = undefined,
  className = '',
  ...props
}) => {
  const ref = useRef(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const axis = direction === 'horizontal' ? 'x' : 'y';
    const offset = reverse ? -distance : distance;

    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
      visibility: 'visible'
    });

    const tl = gsap.timeline({
      paused: true,
      delay,
      onComplete: () => {
        if (onComplete) onComplete();
        if (disappearAfter > 0) {
          gsap.to(el, {
            [axis]: reverse ? distance : -distance,
            scale: 0.8,
            opacity: animateOpacity ? initialOpacity : 0,
            delay: disappearAfter,
            duration: disappearDuration,
            ease: disappearEase,
            onComplete: () => onDisappearanceComplete?.()
          });
        }
      }
    });

    tl.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease
    });

    // Modo controlado: animar quando playWhen fica true (ex: slide ativo)
    if (playWhen !== undefined) {
      if (!playWhen) hasPlayed.current = false;
      else if (!hasPlayed.current) {
        hasPlayed.current = true;
        tl.play();
      }
      return () => {
        tl.kill();
      };
    }

    // Modo ScrollTrigger: animar quando elemento entra na viewport
    const startPct = (1 - threshold) * 100;
    let scrollerTarget = container || document.getElementById('snap-main-container') || null;
    if (typeof scrollerTarget === 'string') {
      scrollerTarget = document.querySelector(scrollerTarget);
    }

    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scrollerTarget,
      start: `top ${startPct}%`,
      once: true,
      onEnter: () => tl.play()
    });

    return () => {
      st.kill();
      tl.kill();
    };
  }, [
    playWhen,
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    delay,
    disappearAfter,
    disappearDuration,
    disappearEase,
    onComplete,
    onDisappearanceComplete
  ]);

  return (
    <div ref={ref} className={className} style={{ visibility: 'hidden' }} {...props}>
      {children}
    </div>
  );
};

export default AnimatedContent;
