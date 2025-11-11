import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Brain, Folder, Settings, Gauge } from 'lucide-react'
import { ReactNode } from 'react'

export default function Features() {
    return (
        <section className="bg-white dark:bg-black py-16 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl text-zinc-900 dark:text-white">Why Choose TellMeMore?</h2>
                    <p className="mt-4 text-zinc-600 dark:text-zinc-300">The essential features that make TellMeMore the best multi-model AI chat platform.</p>
                </div>
                <Card className="mx-auto mt-8 grid max-w-sm grid-cols-1 divide-y overflow-hidden border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-black/30 backdrop-blur-sm shadow-none md:mt-16 md:max-w-full md:grid-cols-4 md:divide-x md:divide-y-0 divide-zinc-200 dark:divide-zinc-600" style={{ boxShadow: '0 0 30px rgba(1, 24, 91, 0.6), 0 0 60px rgba(1, 24, 91, 0.3)' }}>
                    <div className="group text-center">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Brain className="size-6 text-zinc-900 dark:text-white" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium text-zinc-900 dark:text-white">See All Perspectives</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300">Get responses from OpenAI GPT, Google Gemini, and Groq Llama simultaneously. Compare quality, accuracy, and style to find the best answer.</p>
                        </CardContent>
                    </div>
                    <div className="group text-center">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Folder className="size-6 text-zinc-900 dark:text-white" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium text-zinc-900 dark:text-white">Organize Your Conversations</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300">Keep track of all your chats with intelligent session management. Switch between conversations seamlessly and never lose important discussions.</p>
                        </CardContent>
                    </div>
                    <div className="group text-center">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Settings className="size-6 text-zinc-900 dark:text-white" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium text-zinc-900 dark:text-white">Craft Perfect Prompts</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300">Create and manage system prompts and user prompts. Maintain consistency across conversations with reusable prompt templates.</p>
                        </CardContent>
                    </div>
                    <div className="group text-center">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Gauge className="size-6 text-zinc-900 dark:text-white" aria-hidden />
                            </CardDecorator>
                            <h3 className="mt-6 font-medium text-zinc-900 dark:text-white">Transparent Quotas</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300">Clear daily usage limits with real-time tracking. Fair, predictable access to AI models without hidden costs.</p>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] dark:opacity-50"
        />

        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)