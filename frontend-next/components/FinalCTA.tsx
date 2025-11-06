'use client'

import { ArrowRight, Shield, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function FinalCTA() {
    return (
        <section className="relative py-20 md:py-32 overflow-hidden">
            {/* Gradient background with glow */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-black to-purple-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
            
            {/* Grid pattern overlay */}
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                                     linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />

            <div className="mx-auto max-w-4xl px-6 relative z-10 text-center">
                <div className="mb-8">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        Ready to Transform Your
                        <br />
                        <span className="bg-linear-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                            AI Experience?
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                        Join thousands of users who are already using TellMeMore to unlock the power of multiple AI models in one place.
                    </p>
                </div>

                {/* Email signup form */}
                <div className="mb-10 max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 h-12 rounded-xl backdrop-blur-sm"
                        />
                        <Button className="bg-linear-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-semibold h-12 px-8 rounded-xl group">
                            Get Started
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                    <p className="text-sm text-white/60 mt-3">
                        No credit card required · Free tier available forever
                    </p>
                </div>

                {/* Trust indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <div className="flex items-center justify-center gap-3 text-white/80">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium">Enterprise Security</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-white/80">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium">Lightning Fast</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-white/80">
                        <Lock className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium">GDPR Compliant</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
