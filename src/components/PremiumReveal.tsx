import { useEffect, useRef } from 'react';

export function PremiumReveal() {
    const blobRef = useRef<HTMLDivElement>(null);
    const noiseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Basic check for mobile/tablet environments
        const isMob = window.innerWidth <= 768;

        const blob = blobRef.current;
        const noise = noiseRef.current;
        if (!blob) return;

        // Start in the center of the screen
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = window.innerWidth / 2;
        let currentY = window.innerHeight / 2;

        // Easing factor for the spring-like smooth luxurious motion
        const ease = 0.08;
        let requestRef: number;

        const animate = () => {
            // Lerp motion
            currentX += (targetX - currentX) * ease;
            currentY += (targetY - currentY) * ease;

            // Update position variables for the blob mask
            if (blob) {
                // To keep it centered on mouse/screen, we apply the coordinates to the mask position
                blob.style.setProperty('--x', `${currentX}px`);
                blob.style.setProperty('--y', `${currentY}px`);
            }

            requestRef = requestAnimationFrame(animate);
        };

        let hasMoved = false;
        let revealTimeout: NodeJS.Timeout;

        const revealFullSite = () => {
            if (blob) {
                // Expanding the hole to cover the entire screen elegantly
                blob.style.setProperty('--size', '300vw');
                // Fade out softly
                setTimeout(() => {
                    blob.style.opacity = '0';
                    if (noise) noise.style.opacity = '0';

                    // Completely disable rendering to free CPU/GPU
                    setTimeout(() => {
                        blob.style.display = 'none';
                        if (noise) noise.style.display = 'none';
                        cancelAnimationFrame(requestRef);
                    }, 2500);
                }, 1000);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetX = e.clientX;
            targetY = e.clientY;

            if (!hasMoved) {
                hasMoved = true;
                revealTimeout = setTimeout(revealFullSite, 5000);
            }
        };

        const handleClick = () => {
            revealFullSite();
        };

        // If desktop, the blob follows the mouse gracefully
        if (!isMob) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('click', handleClick);
        } else {
            // Mobile: automatically remove the effect after 5 seconds
            revealTimeout = setTimeout(revealFullSite, 5000);
        }

        requestRef = requestAnimationFrame(animate);

        // Initial load cinematic transition
        // It starts at size 0px (pure black screen), then expansively reveals the website
        const timer = setTimeout(() => {
            // Desktop: a 500px viewing hole following the mouse
            // Mobile: 150vw to comfortably reveal the whole central area without mouse tracking
            if (blob) blob.style.setProperty('--size', isMob ? '150vw' : '500px');
        }, 400); // 400ms delay for premium dramatic effect on page load

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleClick);
            cancelAnimationFrame(requestRef);
            clearTimeout(timer);
            clearTimeout(revealTimeout);
        };
    }, []);

    return (
        <>
            {/* Subtle premium cinematic grain texture - Optimized to octaves=1 for performance */}
            <div
                ref={noiseRef}
                className="fixed inset-0 pointer-events-none z-[110] opacity-[0.06] mix-blend-screen transition-opacity duration-1000"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* 
        The Optimized Mask Organic Reveal Blob for WebKit/Chrome
        Replaces intense box-shadows with native GPU mask-image compositing
      */}
            <div
                ref={blobRef}
                className="fixed inset-0 pointer-events-none z-[100]"
                style={{
                    backgroundColor: 'black',
                    // The magic happens here: a reverse radial gradient mask that punches a hole in the black background
                    WebkitMaskImage: 'radial-gradient(circle var(--size, 0px) at var(--x, 50vw) var(--y, 50vh), transparent 0%, transparent 60%, black 100%)',
                    maskImage: 'radial-gradient(circle var(--size, 0px) at var(--x, 50vw) var(--y, 50vh), transparent 0%, transparent 60%, black 100%)',
                    // Hardware compose
                    willChange: 'mask-image, -webkit-mask-image, opacity',
                    // Growth animation
                    transition: 'opacity 2.5s cubic-bezier(0.16, 1, 0.3, 1), --size 2.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                {/* 
                  Inner glowing red element that exists *inside* the masked black layer,
                  following the exact same Lerp coordinates to give the premium lighting effect
                */}
                <div
                    className="absolute pointer-events-none rounded-full"
                    style={{
                        left: 'var(--x, 50vw)',
                        top: 'var(--y, 50vh)',
                        transform: 'translate(-50%, -50%)',
                        width: 'calc(var(--size, 0px) * 1.5)',
                        height: 'calc(var(--size, 0px) * 1.5)',
                        backgroundColor: 'rgba(229, 77, 53, 0.15)',
                        filter: 'blur(40px)',
                        boxShadow: '0 0 100px 50px rgba(229, 77, 53, 0.2)',
                        transition: 'width 2.5s cubic-bezier(0.16, 1, 0.3, 1), height 2.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        animation: 'blob-organic-shape 12s ease-in-out infinite alternate',
                    }}
                />
            </div>
            <style>{`
        @property --size {
          syntax: '<length> | <percentage>';
          inherits: false;
          initial-value: 0px;
        }
        @keyframes blob-organic-shape {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
          67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        }
      `}</style>
        </>
    );
}
