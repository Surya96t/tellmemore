'use client'

import { Badge } from '@/components/ui/badge'
import { CardContent, CardHeader } from '@/components/ui/card'
import { CardSpotlight } from '@/components/ui/card-spotlight'
import { UserPlus, MessageSquare, GitCompareArrows, ArrowRight } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'

export default function HowItWorks() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        const currentSection = sectionRef.current
        if (currentSection) {
            observer.observe(currentSection)
        }

        return () => {
            if (currentSection) {
                observer.unobserve(currentSection)
            }
        }
    }, [])

    return (
        <section ref={sectionRef} className="bg-black py-16 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl text-white">
                        Get Started in 3 Simple Steps
                    </h2>
                    <p className="mt-4 text-white/80">From signup to insights in minutes</p>
                </div>

                <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
                    {/* Connecting arrows for desktop */}
                    <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5">
                        <div className="absolute left-[calc(33.33%-2rem)] top-0 flex items-center gap-2 text-white/40">
                            <div className="h-0.5 w-24 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
                            <ArrowRight className="size-5" />
                        </div>
                        <div className="absolute left-[calc(66.66%-2rem)] top-0 flex items-center gap-2 text-white/40">
                            <div className="h-0.5 w-24 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
                            <ArrowRight className="size-5" />
                        </div>
                    </div>

                    {/* Step 1 */}
                    <div
                        className={`transition-all duration-700 ease-out ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '0ms' }}
                    >
                        <StepCard
                            number={1}
                            icon={<UserPlus className="size-8 text-white" />}
                            title="Sign Up & Choose Models"
                            description="Quick registration and select your preferred AI models"
                        />
                    </div>

                    {/* Step 2 */}
                    <div
                        className={`transition-all duration-700 ease-out ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '200ms' }}
                    >
                        <StepCard
                            number={2}
                            icon={<MessageSquare className="size-8 text-white" />}
                            title="Ask Your Question"
                            description="Type your question and watch multiple AI models respond"
                        />
                    </div>

                    {/* Step 3 */}
                    <div
                        className={`transition-all duration-700 ease-out ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '400ms' }}
                    >
                        <StepCard
                            number={3}
                            icon={<GitCompareArrows className="size-8 text-white" />}
                            title="Compare & Save"
                            description="Compare responses, save the best ones, and organize in sessions"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

interface StepCardProps {
    number: number
    icon: ReactNode
    title: string
    description: string
}

function StepCard({ number, icon, title, description }: StepCardProps) {
    return (
        <CardSpotlight className="group relative overflow-hidden border-zinc-700 bg-black/30 backdrop-blur-sm shadow-none hover:border-zinc-600 transition-all duration-300">
            {/* Subtle navy glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                style={{ boxShadow: '0 0 30px rgba(1, 24, 91, 0.4) inset' }} 
            />
            
            <CardHeader className="pb-4 relative z-10">
                <div className="flex flex-col items-center text-center">
                    {/* Number badge */}
                    <Badge 
                        className="mb-6 h-12 w-12 rounded-full bg-linear-to-br from-blue-600 to-blue-800 text-xl font-bold text-white border-0 flex items-center justify-center"
                    >
                        {number}
                    </Badge>
                    
                    {/* Icon */}
                    <div className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                        {icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
            </CardHeader>
            
            <CardContent className="text-center relative z-10">
                <p className="text-sm text-white/70 leading-relaxed">{description}</p>
            </CardContent>
        </CardSpotlight>
    )
}
