'use client'

import MagicBento from '@/components/MagicBento'

export default function BentoShowcase() {
    return (
        <section className="bg-black py-16 md:py-32 flex flex-col items-center">
            <div className="mx-auto max-w-7xl px-6 w-full">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl text-white">
                        Powerful Features & Benefits
                    </h2>
                    <p className="mt-4 text-white/80">
                        Everything you need for smarter AI conversations
                    </p>
                </div>

                <div className="flex justify-center">
                    <MagicBento 
                        textAutoHide={true}
                        enableStars={true}
                        enableSpotlight={true}
                        enableBorderGlow={true}
                        enableTilt={false}
                        enableMagnetism={false}
                        clickEffect={true}
                        spotlightRadius={300}
                        particleCount={8}
                        glowColor="30, 64, 175"
                    />
                </div>
            </div>
        </section>
    )
}
