'use client'

import { Gemini, OpenAI, Groq } from '@/components/logos'
import { Sparkles, Zap, BarChart3, Check, Shield, Clock, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function IntegrationsSection() {
    const features = [
        { icon: <Check className="w-5 h-5" />, text: "No Credit Card Required" },
        { icon: <Clock className="w-5 h-5" />, text: "Instant Setup (< 1 minute)" },
        { icon: <Shield className="w-5 h-5" />, text: "Simple & Intuitive" },
    ]

    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length)
        }, 3000) // Change every 3 seconds

        return () => clearInterval(interval)
    }, [features.length])

    return (
        <section className="w-full h-full flex flex-col justify-between">
            <div className="mx-auto max-w-lg px-4 w-full space-y-8">
                
                {/* Top: Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard icon={<Sparkles className="w-5 h-5" />} value="9+" label="AI Models" />
                    <StatCard icon={<Zap className="w-5 h-5" />} value="Compare" label="Side-by-Side" />
                    <StatCard icon={<BarChart3 className="w-5 h-5" />} value="Free" label="To Start" />
                </div>

                {/* Middle: Integrations */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-balance text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
                            Integrate with your favorite LLMs
                        </h2>
                        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                            Connect seamlessly with popular platforms and services to enhance your workflow.
                        </p>
                    </div>

                    {/* Integration Cards Container - Glassmorphism */}
                    <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/30 dark:border-white/20 rounded-2xl px-8 py-8 shadow-2xl">
                        <Integration
                            icon={<OpenAI />}
                            name="GPT-5 / GPT-5 Mini / GPT Nano"
                            description="OpenAI's latest generation models with enhanced capabilities."
                        />
                        <Integration
                            icon={<Gemini />}
                            name="Gemini 2.5 Pro / Flash / Lite"
                            description="Google's newest multimodal AI with advanced reasoning."
                        />
                        <Integration
                            icon={<Groq />}
                            name="LLaMA 3.3 70B / 3.1 8B"
                            description="Meta's open models with Groq's ultra-fast inference."
                        />
                    </div>
                </div>

                {/* Bottom: Feature Highlights Carousel */}
                <div className="space-y-4">

                    <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/30 dark:border-white/20 rounded-2xl px-6 py-8 shadow-2xl">
                        {/* Carousel Container with Vertical Dots */}
                        <div className="relative flex items-center gap-4">
                            {/* Carousel Content */}
                            <div className="flex-1 relative h-20 overflow-hidden">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                                            index === currentIndex
                                                ? 'opacity-100 translate-y-0'
                                                : index < currentIndex
                                                ? 'opacity-0 -translate-y-full'
                                                : 'opacity-0 translate-y-full'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full space-y-3">
                                            <div className="w-12 h-12 bg-green-500/20 dark:bg-green-500/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                                {feature.icon}
                                            </div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white text-center">
                                                {feature.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Vertical Dots Indicator - Right Side */}
                            <div className="flex flex-col gap-3">
                                {features.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            index === currentIndex
                                                ? 'bg-green-600 dark:bg-green-400 h-8'
                                                : 'bg-zinc-300 dark:bg-zinc-600'
                                        }`}
                                        aria-label={`Go to feature ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => {
    return (
        <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/30 dark:border-white/20 rounded-xl p-4 text-center shadow-lg">
            <div className="flex justify-center mb-2 text-blue-600 dark:text-blue-400">
                {icon}
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{label}</div>
        </div>
    )
}

const Integration = ({ icon, name, description }: { icon: React.ReactNode; name: string; description: string }) => {
    return (
        <div className="grid grid-cols-[auto_1fr] items-center gap-4 border-b border-dashed border-white/20 dark:border-white/10 py-6 last:border-b-0">
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-sm border border-white/30 dark:border-white/20 flex size-16 items-center justify-center rounded-lg shadow-lg">
                {icon}
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{name}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    )
}
