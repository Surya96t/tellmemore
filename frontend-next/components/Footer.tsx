'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
    /* 
     * Commented out - placeholder links not needed yet
     * 
     * const footerLinks = {
     *     Product: [
     *         { name: 'Features', href: '#features' },
     *         { name: 'Pricing', href: '#pricing' },
     *         { name: 'How It Works', href: '#how-it-works' },
     *         { name: 'FAQ', href: '#faq' }
     *     ],
     *     Company: [
     *         { name: 'About', href: '/about' },
     *         { name: 'Blog', href: '/blog' },
     *         { name: 'Careers', href: '/careers' },
     *         { name: 'Contact', href: '/contact' }
     *     ],
     *     Resources: [
     *         { name: 'Documentation', href: '/docs' },
     *         { name: 'API Reference', href: '/api' },
     *         { name: 'Community', href: '/community' },
     *         { name: 'Support', href: '/support' }
     *     ],
     *     Legal: [
     *         { name: 'Privacy Policy', href: '/privacy' },
     *         { name: 'Terms of Service', href: '/terms' },
     *         { name: 'Cookie Policy', href: '/cookies' },
     *         { name: 'Security', href: '/security' }
     *     ]
     * }
     *
     * const socialLinks = [
     *     { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/tellmemore' },
     *     { name: 'GitHub', icon: Github, href: 'https://github.com/tellmemore' },
     *     { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/tellmemore' },
     *     { name: 'Email', icon: Mail, href: 'mailto:hello@tellmemore.ai' }
     * ]
     */

    return (
        <footer className="relative overflow-hidden">
            {/* Frosted glass background */}
            <div className="absolute inset-0 backdrop-blur-sm" />
           
            {/* Subtle gradient overlay */}
            {/*<div className="absolute inset-0 bg-linear-to-b from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:via-transparent dark:to-purple-500/10 pointer-events-none" />
            */}
            {/* Top gradient border accent */}
            {/*<div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-400/30 to-transparent" />
            */}
            <div className="relative w-full px-2 py-2">
                {/* Simplified footer content - brand and copyright only */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 max-w-full">
                    {/* Brand - pushed to left edge */}
                    <Link href="/" className="inline-flex items-center gap-2 group md:shrink-0">
                        {/* Favicon logo */}
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105">
                            <Image 
                                src="/favicon.ico" 
                                alt="TellMeMore Logo" 
                                width={32} 
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-lg font-bold text-zinc-900 dark:text-white">TellMeMore</span>
                    </Link>

                    {/* Copyright - pushed to right edge */}
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm whitespace-nowrap md:shrink-0">
                        © {new Date().getFullYear()} TellMeMore. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
