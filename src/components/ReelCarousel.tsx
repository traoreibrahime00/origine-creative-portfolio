import { useRef, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';

// High-end agency/design placeholder images
const column1Images = [
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=80', // design branding
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&q=80', // agency
    'https://images.unsplash.com/photo-1620287341056-49a2f1ab2fdc?w=500&q=80', // abstract light
];

const column2Images = [
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&q=80', // abstract shape
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80', // strategy
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&q=80', // graphic
];

export function ReelCarousel() {
    return (
        <div className="w-full max-w-md aspect-[4/5] rounded-[3rem] bg-zinc-950 border border-white/10 relative overflow-hidden shadow-2xl flex gap-4 p-4 rotate-[-4deg] scale-105 group" style={{ perspective: "1000px" }}>

            {/* Dark elegant gradients top/bottom to blend edges */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-10 pointer-events-none"></div>

            <Column images={column1Images} direction={-1} speed={0.5} />
            <Column images={column2Images} direction={1} speed={0.4} />

            {/* Red Light reflection in the center */}
            <div className="absolute inset-0 bg-[hsl(var(--accent-red))]/10 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[hsl(var(--accent-red))] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        </div>
    );
}

function Column({ images, direction, speed }: { images: string[], direction: number, speed: number }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [y, setY] = useState(0);
    const itemHeight = 240; // Approx height + gap
    const totalHeight = images.length * itemHeight;

    useAnimationFrame((_, delta) => {
        // We calculate movement based on time for pure smoothness
        const moveBy = direction * speed * (delta / 16);

        setY((prevY) => {
            let nextY = prevY + moveBy;
            // Seamless looping logic
            if (direction === -1) {
                if (nextY <= -totalHeight) nextY += totalHeight;
            } else {
                if (nextY >= 0) nextY -= totalHeight;
            }
            return nextY;
        });
    });

    // Create 3 identical sets to ensure continuous stream
    const loopingImages = [...images, ...images, ...images];

    return (
        <div
            className="w-1/2 flex flex-col gap-4 relative"
            ref={containerRef}
        >
            <motion.div
                className="flex flex-col gap-4 will-change-transform"
                style={{ y: direction === 1 ? y - totalHeight : y }} // Offset if moving down
                whileHover={{ scale: 0.98, opacity: 0.8 }}
                transition={{ duration: 0.3 }}
            >
                {loopingImages.map((src, idx) => (
                    <div
                        key={idx}
                        className="w-full h-56 rounded-2xl overflow-hidden shrink-0 relative bg-zinc-900 border border-white/5"
                    >
                        <img
                            src={src}
                            alt={`Reel image ${idx}`}
                            className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
