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
    imageWidth = 300,
    imageHeight = 200,
    rotateSpeed = 30
}: Carousel3DProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Filter valid images and fallback if essential
    const validImages = images.filter(Boolean);
    if (validImages.length === 0) return null;

    const count = validImages.length;
    // Calculate spread angle for each image
    const spreadAngle = 360 / count;

    // Dynamically calculate radius so images don't overlap too much based on count
    // Math: width / (2 * Math.tan(Math.PI / count))
    const calculatedRadius = Math.max(radius, (imageWidth / 2) / Math.tan(Math.PI / count) + 50);

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ perspective: '1200px' }}>

            {/* 3D Carousel Container */}
            <div
                className="relative"
                style={{
                    width: imageWidth,
                    height: imageHeight,
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
                            className="absolute top-0 left-0 transition-transform duration-300 hover:scale-110 cursor-pointer"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{
                                width: imageWidth,
                                height: imageHeight,
                                transform: `rotateY(${angle}deg) translateZ(${calculatedRadius}px)`,
                                transformOrigin: 'center center'
                            }}
                        >
                            <img
                                src={src}
                                alt={`Sliding 3D item ${idx}`}
                                className="w-full h-full object-cover rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-white/10"
                            />
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes spin3d {
                    from { transform: rotateY(0deg); }
                    to { transform: rotateY(360deg); }
                }
            `}</style>
        </div>
    );
}
