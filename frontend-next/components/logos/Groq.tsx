import { type SVGProps } from 'react'

export default function Groq(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height="1em"
            style={{
                flex: 'none',
                lineHeight: 1,
            }}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            {...props}>
            <title>{'Groq'}</title>
            <defs>
                <linearGradient
                    id="groq-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%">
                    <stop offset="0%" stopColor="#FF6B35" />
                    <stop offset="100%" stopColor="#F7931E" />
                </linearGradient>
            </defs>
            {/* Lightning bolt icon matching Groq branding */}
            <path
                d="M13 2L3 14h8l-2 8 10-12h-8l2-8z"
                fill="url(#groq-gradient)"
            />
        </svg>
    )
}

