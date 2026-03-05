import { ReactNode } from "react";

export interface AnimatedContentProps {
  children: ReactNode;
  container?: Element | string | null;
  playWhen?: boolean;
  distance?: number;
  direction?: string;
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  [key: string]: unknown;
}

declare const AnimatedContent: (props: AnimatedContentProps) => JSX.Element;
export default AnimatedContent;
