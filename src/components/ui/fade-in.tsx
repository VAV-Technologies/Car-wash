'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    fullWidth?: boolean;
}

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 700,
    direction = 'up',
    fullWidth = false,
}: FadeInProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    const getDirectionClass = () => {
        switch (direction) {
            case 'up':
                return 'slide-in-from-bottom-8';
            case 'down':
                return 'slide-in-from-top-8';
            case 'left':
                return 'slide-in-from-right-8';
            case 'right':
                return 'slide-in-from-left-8';
            default:
                return '';
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                'transition-all',
                isVisible ? 'opacity-100 animate-in fade-in zoom-in-95' : 'opacity-0',
                isVisible && getDirectionClass(),
                fullWidth ? 'w-full' : '',
                className
            )}
            style={{
                animationDuration: `${duration}ms`,
                animationDelay: `${delay}ms`,
                animationFillMode: 'both',
            }}
        >
            {children}
        </div>
    );
}
