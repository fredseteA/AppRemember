import { useState, useEffect } from 'react';

const hasRevealed = { current: false }; 

export const usePageReveal = () => {
  const [revealed, setRevealed] = useState(hasRevealed.current);

  useEffect(() => {
    if (hasRevealed.current) return; 

    const handler = () => {
      hasRevealed.current = true;
      setRevealed(true);
    };

    window.addEventListener('ls:revealed', handler);
    return () => window.removeEventListener('ls:revealed', handler);
  }, []);

  return revealed;
};