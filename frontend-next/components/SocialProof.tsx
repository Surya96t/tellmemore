'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Users, CheckCircle } from 'lucide-react'

const techLogos = [
    { name: 'OpenAI', icon: '🤖' },
    { name: 'Google Gemini', icon: '🔷' },
    { name: 'Groq', icon: '⚡' },
    { name: 'Next.js', icon: '▲' },
    { name: 'FastAPI', icon: '🚀' },
    { name: 'PostgreSQL', icon: '🐘' },
]

const stats = [
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Messages Processed', value: '1M+', icon: Zap },
    { label: 'Uptime', value: '99.9%', icon: CheckCircle },
    { label: 'Secure & Private', value: 'SOC 2', icon: Shield },
]

export default function SocialProof() {
    return (
        <section className="bg-linear-to-b from-black via-slate-950 to-black py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6">
                {/* Trust Badges */}
                <div className="text-center mb-12">
                    <p className="text-sm uppercase tracking-wider text-white/60 mb-8">
                        Trusted by developers and teams worldwide
                    </p>
                    
                    {/* Tech Stack Marquee */}
                    <div className="relative overflow-hidden py-8">
                        <div className="flex gap-12 animate-marquee">
                            {[...techLogos, ...techLogos].map((tech, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 px-6 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 whitespace-nowrap"
                                >
                                    <span className="text-3xl">{tech.icon}</span>
                                    <span className="text-white/80 font-medium">{tech.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <div className="text-center p-6 rounded-xl bg-linear-to-br from-white/5 to-white/2 border border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
                                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400 group-hover:text-blue-300 transition-colors" />
                                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </div>
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                        </motion.div>
                    ))}
                </div>

                {/* Security Badge */}
                <div className="mt-12 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 backdrop-blur-sm">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-white/90 font-medium">Enterprise-grade Security & Privacy</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </section>
    )
}
