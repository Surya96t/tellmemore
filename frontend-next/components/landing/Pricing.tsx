'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Pricing() {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            description: 'Perfect for getting started',
            features: [
                '50 messages per day',
                'Access to GPT-5 Mini',
                'Basic prompt library',
                'Web interface',
                'Community support'
            ],
            cta: 'Start Free',
            popular: false
        },
        {
            name: 'Pro',
            price: '$19',
            period: 'per month',
            description: 'For power users and professionals',
            features: [
                'Unlimited messages',
                'All premium models (GPT-5, Gemini 2.5 Pro, LLaMA 3.3)',
                'Advanced prompt library',
                'Priority support',
                'API access',
                'Custom system prompts',
                'Export conversations',
                'Team collaboration (up to 5 users)'
            ],
            cta: 'Get Pro',
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: 'contact us',
            description: 'For teams and organizations',
            features: [
                'Everything in Pro',
                'Unlimited team members',
                'SSO & advanced security',
                'Dedicated support',
                'Custom model fine-tuning',
                'On-premise deployment',
                'SLA guarantee',
                'Advanced analytics'
            ],
            cta: 'Contact Sales',
            popular: false
        }
    ]

    return (
        <section className="bg-black py-16 md:py-32 relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-linear-to-b from-blue-950/20 via-black to-black pointer-events-none" />
            
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl text-white">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="mt-4 text-white/80 max-w-2xl mx-auto">
                        Choose the plan that works for you. Upgrade or downgrade anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl border ${
                                plan.popular
                                    ? 'border-blue-500 shadow-xl shadow-blue-500/20'
                                    : 'border-white/10'
                            } bg-black/50 backdrop-blur-sm p-8 flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-linear-to-r from-blue-600 to-blue-400 text-white text-sm font-semibold px-4 py-1 rounded-full">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                                    {plan.period !== 'contact us' && (
                                        <span className="text-white/60">/ {plan.period}</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                        <span className="text-white/80 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full ${
                                    plan.popular
                                        ? 'bg-linear-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300'
                                        : 'bg-white/10 hover:bg-white/20 border border-white/20'
                                } text-white font-semibold py-6 rounded-xl transition-all`}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-white/60 text-sm">
                        All plans include a 14-day money-back guarantee. No credit card required for free tier.
                    </p>
                </div>
            </div>
        </section>
    )
}
