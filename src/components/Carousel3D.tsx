import { useState, useEffect } from 'react';

type Carousel3DProps = {
    images: string[];
    radius?: number;
    imageWidth?: number;
    imageHeight?: number;
    rotateSpeed?: number;
};

export function Carousel3D({
    images,
    radius = 400,
    imageWidth = 800, // Bigger default size
    imageHeight = 450,
    rotateSpeed = 90
}: Carousel3DProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [dimensions, setDimensions] = useState({ width: imageWidth, height: imageHeight, adjustedRadius: radius });

    const validImages = images.filter(Boolean);
    const count = validImages.length;

    useEffect(() => {
        if (count === 0) return;

        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            // Scale based on screen size
            let baseW = isMobile ? window.innerWidth * 0.7 : imageWidth;
            let baseH = isMobile ? baseW * (imageHeight / imageWidth) : imageHeight;

            // Reduce further if massive amount of images
            if (count > 20) {
                baseW = baseW * 0.75;
                baseH = baseH * 0.75;
            }

            // Calculate precise radius so images attach edge-to-edge + buffer
            const calcRadius = Math.max(isMobile ? 150 : radius, (baseW / 2) / Math.tan(Math.PI / count) + (isMobile ? 20 : 50));

            setDimensions({ width: baseW, height: baseH, adjustedRadius: calcRadius });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [imageWidth, imageHeight, radius, count]);

    if (validImages.length === 0) return null;

    const spreadAngle = 360 / count;
    const { width: finalWidth, height: finalHeight, adjustedRadius: calculatedRadius } = dimensions;

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ perspective: '1500px' }}>

            {/* 3D Carousel Container */}
            <div
                className="relative"
                style={{
                    width: finalWidth,
                    height: finalHeight,
                    transformStyle: 'preserve-3d',
                    animation: `spin3d ${rotateSpeed}s infinite linear`,
                    animationPlayState: isHovered ? 'paused' : 'running',
                }}
            >
                {validImages.map((src, idx) => {
                    const angle = idx * spreadAngle;
                    return (
                        <div
                            key={idx}
                            className="absolute top-0 left-0 transition-transform duration-300 hover:scale-105 cursor-pointer"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{
                                width: finalWidth,
                                height: finalHeight,
                                transform: `rotateY(${angle}deg) translateZ(${calculatedRadius}px)`,
                                transformOrigin: 'center center'
                            }}
                        >
                            <img
                                src={src}
                                alt={`Sliding 3D item ${idx}`}
                                loading="lazy"
                                className="w-full h-full object-cover rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10"
                            />
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes spin3d {
                    from { transform: translateZ(-${calculatedRadius}px) rotateY(0deg); }
                    to { transform: translateZ(-${calculatedRadius}px) rotateY(360deg); }
                }
            `}</style>
        </div>
    );
}
