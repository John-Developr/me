import { useState, useCallback, useEffect } from 'react';

const useMediaQuery = (width: number): boolean => {
  const [targetReached, setTargetReached] = useState(false);

  const updateTarget = useCallback((event: MediaQueryListEvent) => {
    setTargetReached(event.matches);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${width}px)`);

    // Initial check
    setTargetReached(mediaQuery.matches);

    // Add event listener
    mediaQuery.addEventListener('change', updateTarget);

    return () => {
      mediaQuery.removeEventListener('change', updateTarget);
    };
  }, [width, updateTarget]);

  return targetReached;
};

export default useMediaQuery;