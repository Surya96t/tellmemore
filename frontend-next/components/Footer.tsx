'use client'

import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
    const footerLinks = {
        Product: [
            { name: 'Features', href: '#features' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'How It Works', href: '#how-it-works' },
            { name: 'FAQ', href: '#faq' }
        ],
        Company: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact', href: '/contact' }
        ],
        Resources: [
            { name: 'Documentation', href: '/docs' },
            { name: 'API Reference', href: '/api' },
            { name: 'Community', href: '/community' },
            { name: 'Support', href: '/support' }
        ],
        Legal: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Cookie Policy', href: '/cookies' },
            { name: 'Security', href: '/security' }
        ]
    }

    const socialLinks = [
        { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/tellmemore' },
        { name: 'GitHub', icon: Github, href: 'https://github.com/tellmemore' },
        { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/tellmemore' },
        { name: 'Email', icon: Mail, href: 'mailto:hello@tellmemore.ai' }
    ]

    return (
        <footer className="bg-black border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
                {/* Main footer content */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-blue-400" />
                            <span className="text-xl font-bold text-white">TellMeMore</span>
                        </Link>
                        <p className="text-white/60 text-sm mb-6">
                            The intelligent platform for multi-model AI conversations.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((link) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-white/60 hover:text-white transition-colors"
                                        aria-label={link.name}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Links columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="text-white font-semibold mb-4">{category}</h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-white/60 hover:text-white text-sm transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white/60 text-sm">
                        © {new Date().getFullYear()} TellMeMore. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <Link href="/status" className="text-white/60 hover:text-white transition-colors">
                            Status
                        </Link>
                        <Link href="/changelog" className="text-white/60 hover:text-white transition-colors">
                            Changelog
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-white/60">All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
