import { useState } from 'react';

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
    imageWidth = 600, // Bigger default size
    imageHeight = 400,
    rotateSpeed = 40
}: Carousel3DProps) {
    const [isHovered, setIsHovered] = useState(false);

    const validImages = images.filter(Boolean);
    if (validImages.length === 0) return null;

    const count = validImages.length;

    // Auto-adjust size slightly if there are a massive number of images to prevent insane radius values
    let finalWidth = imageWidth;
    let finalHeight = imageHeight;
    if (count > 20) {
        finalWidth = 400;
        finalHeight = 280;
    }

    const spreadAngle = 360 / count;
    // Calculate exact radius needed to form a gapless polygon (plus a 50px buffer)
    const calculatedRadius = Math.max(radius, (finalWidth / 2) / Math.tan(Math.PI / count) + 50);

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
