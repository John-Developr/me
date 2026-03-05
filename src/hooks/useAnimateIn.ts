import { useEffect, useRef, useState } from "react";

interface UseAnimateInOptions {
  /** Delay before animation starts in milliseconds (default: 0) */
  delay?: number;
  /** Duration of the animation in milliseconds (default: 500) */
  duration?: number;
  /** Y offset to animate from in px (default: 20) */
  fromY?: number;
  /** Trigger animation when element enters viewport (default: true) */
  triggerOnView?: boolean;
  /** Intersection observer threshold (default: 0.1) */
  threshold?: number;
}

interface AnimateInResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  style: React.CSSProperties;
  isVisible: boolean;
}

/**
 * useAnimateIn — animates an element from translateY(fromY px) to translateY(0)
 * with optional delay, duration, and scroll-trigger support.
 *
 * Pass the element type as a generic to get a fully typed ref with no casting needed.
 *
 * @example
 * // Basic usage
 * const { ref, style } = useAnimateIn<HTMLDivElement>({ delay: 200 });
 * return <div ref={ref} style={style}>Hello</div>;
 *
 * @example
 * // Staggered list items
 * {items.map((item, i) => {
 *   const { ref, style } = useAnimateIn<HTMLDivElement>({ delay: i * 100 });
 *   return <div key={i} ref={ref} style={style}>{item}</div>;
 * })}
 */
export function useAnimateIn<T extends HTMLElement = HTMLDivElement>({
  delay = 0,
  duration = 500,
  fromY = 20,
  triggerOnView = true,
  threshold = 0.1,
}: UseAnimateInOptions = {}): AnimateInResult<T> {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(!triggerOnView);

  useEffect(() => {
    if (!triggerOnView) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // animate only once
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [triggerOnView, threshold]);

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0px)" : `translateY(${fromY}px)`,
    transition: isVisible
      ? `opacity ${duration}ms ease, transform ${duration}ms ease`
      : "none",
    transitionDelay: isVisible ? `${delay}ms` : "0ms",
  };

  return { ref, style, isVisible };
}