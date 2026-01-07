import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  timeout: number; // in milliseconds
  onIdle: () => void;
  events?: string[];
}

export function useIdleTimeout({ 
  timeout, 
  onIdle, 
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'] 
}: UseIdleTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);

  // Update the onIdle callback ref when it changes
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  // Reset the timeout
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onIdleRef.current();
    }, timeout);
  }, [timeout]);

  // Setup event listeners
  useEffect(() => {
    // Reset timeout on component mount
    resetTimeout();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [resetTimeout, events]);

  // Return manual reset function
  return { resetTimeout };
}