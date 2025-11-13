/**
 * HowItWorks Component
 * 
 * 3-step process showing how to get started with TellMeMore.
 * Clean, simple design with animated connectors and gradient badges.
 */

import { UserPlus, MessageSquare, GitCompare } from "lucide-react";
import { useInView } from "@/hooks/useInView";

export default function HowItWorks() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: "Sign Up",
      description: "Create your free account in seconds. No credit card required to get started with your AI journey.",
      gradient: "from-blue-500 to-purple-500",
      iconColor: "text-blue-500",
    },
    {
      number: 2,
      icon: MessageSquare,
      title: "Ask Questions",
      description: "Type your question once and see responses from GPT-4, Gemini, and LLaMA3 side-by-side in real-time.",
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-500",
    },
    {
      number: 3,
      icon: GitCompare,
      title: "Compare Answers",
      description: "Analyze different perspectives, choose the best answer, and make better decisions faster.",
      gradient: "from-pink-500 to-red-500",
      iconColor: "text-pink-500",
    },
  ];

  return (
    <section ref={sectionRef} className="w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Get started in three simple steps and experience the power of multiple AI minds.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const animationDelay = inView ? `${index * 200}ms` : '0ms';
            
            return (
              <div 
                key={step.number} 
                className={`relative text-center group transition-all duration-700 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: animationDelay }}
              >
                {/* Arrow Connector (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-12 lg:-right-16 z-10">
                    <svg 
                      width="80" 
                      height="40" 
                      viewBox="0 0 80 40" 
                      fill="none" 
                      className="opacity-80"
                    >
                      {/* Simple arrow */}
                      <path
                        d="M 5 20 L 75 20 M 75 20 L 67 13 M 75 20 L 67 27"
                        className="stroke-black dark:stroke-zinc-600"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Step Card with Hover Effect */}
                <div className="transition-transform duration-300 hover:scale-105">
                  {/* Icon Badge with Gradient */}
                  <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg relative group-hover:shadow-xl transition-shadow`}>
                    <IconComponent className="w-10 h-10 text-white" />
                    {/* Number Badge */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-md border-2 border-zinc-100 dark:border-zinc-800">
                      <span className={`text-sm font-bold ${step.iconColor}`}>{step.number}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
