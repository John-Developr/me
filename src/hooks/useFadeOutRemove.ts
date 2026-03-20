import { useEffect, RefObject } from "react";

/**
 * Adds a fade-out class to an element after a delay, then removes it after animation ends.
 * @param ref - React ref to the element
 * @param fadeOutTrigger - boolean to trigger fade out
 * @param options.delay - delay before starting fade-out (ms)
 * @param options.fadeOutClass - CSS class to apply for fade-out animation
 */
export function useFadeOutRemove(
  ref: RefObject<HTMLElement | null>,
  fadeOutTrigger: boolean,
  options: { delay: number; fadeOutClass: string; callback?: () => void }
) {
  const { delay, fadeOutClass } = options;

  useEffect(() => {
    if (!fadeOutTrigger) 
      return;

     document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      const el = ref.current;
      if (!el) 
        return;

      el.classList.add(fadeOutClass);

      const handleAnimationEnd = () => {
        document.body.style.overflow = "";
        options.callback?.();
      };

      el.addEventListener(
        'animationend', 
        handleAnimationEnd
      );

      // Cleanup if component unmounts before animation ends
      return () => {
        el.removeEventListener(
          'animationend', 
          handleAnimationEnd
        );
        
        document.body.style.overflow = "";
      };
    }, delay);

    return () => clearTimeout(timer);
  }, [
    options,
    fadeOutTrigger, 
    ref, 
    delay, 
    fadeOutClass,
    options.callback
  ]);
}
