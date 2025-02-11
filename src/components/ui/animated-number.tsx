import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({ value, prefix = '', className, duration = 500 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationFrame = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    if (previousValue.current === value) return;

    const startValue = previousValue.current;
    const endValue = value;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
        startTime.current = 0;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}{displayValue.toFixed(2)}
    </span>
  );
}

// Easing function for smooth animation
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}