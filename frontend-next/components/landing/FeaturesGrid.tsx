/**
 * FeaturesGrid Component
 * 
 * Displays 6 feature cards in a responsive grid layout with 3D tilt effects.
 * Each card has glassmorphic styling with gradient backgrounds, icons, title, and description.
 * 
 * Features:
 * - TiltedCard component for 3D mouse-tracking effects
 * - Card, CardHeader, CardTitle, CardDescription from shadcn/ui
 * - lucide-react icons (Shield, ArrowRightLeft, Edit3, Zap, Lightbulb, Lock)
 * - Responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
 * - Spring physics for smooth animations
 * - Gradient backgrounds with enhanced blur on hover
 */

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, ArrowRightLeft, Edit3, Zap } from "lucide-react";
import TiltedCard from "@/components/TiltedCard";
import IntegrationsSection from "@/components/integrations-6";
import { useInView } from "@/hooks/useInView";

export default function FeaturesGrid() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const features = [
    {
      Icon: Shield,
      title: "See All Perspectives",
      description: "Get responses from GPT-4, Google Gemini, and Groq LLaMA3 simultaneously to make better-informed decisions.",
      gradient: "from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20",
      iconBg: "bg-blue-500/20 dark:bg-blue-500/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      gradientColors: { start: "rgb(59,130,246)", end: "rgb(168,85,247)" },
    },
    {
      Icon: ArrowRightLeft,
      title: "Organize Your Conversations",
      description: "Keep track of all your chats with intelligent session management. Search, rename, and seamlessly switch between conversations.",
      gradient: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20",
      iconBg: "bg-purple-500/20 dark:bg-purple-500/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      gradientColors: { start: "rgb(168,85,247)", end: "rgb(236,72,153)" },
    },
    {
      Icon: Edit3,
      title: "Craft Perfect Prompts",
      description: "Create and save custom prompts for repeated tasks. Access our library of system prompts or build your own templates.",
      gradient: "from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20",
      iconBg: "bg-indigo-500/20 dark:bg-indigo-500/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      gradientColors: { start: "rgb(99,102,241)", end: "rgb(59,130,246)" },
    },
    {
      Icon: Zap,
      title: "Transparent Quota",
      description: "Clear visibility into your token usage with real-time tracking. Fair, predictable access to all AI models without hidden costs.",
      gradient: "from-pink-500/10 to-red-500/10 dark:from-pink-500/20 dark:to-red-500/20",
      iconBg: "bg-pink-500/20 dark:bg-pink-500/30",
      iconColor: "text-pink-600 dark:text-pink-400",
      gradientColors: { start: "rgb(236,72,153)", end: "rgb(239,68,68)" },
    },
  ];

  return (
    <section ref={sectionRef} className="w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            Why Choose TellMeMore?
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            The essential features that make TellMeMore the best multi-model AI chat platform.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column - 4 Feature Cards Stacked */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const IconComponent = feature.Icon;
              const animationDelay = inView ? `${index * 150}ms` : '0ms';
              
              // Create gradient SVG data URL
              const gradientSVG = `
                <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:${feature.gradientColors.start};stop-opacity:0.25" />
                      <stop offset="100%" style="stop-color:${feature.gradientColors.end};stop-opacity:0.25" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="400" fill="url(#grad${index})" rx="24" />
                </svg>
              `.trim();
              
              const gradientDataURL = `data:image/svg+xml;base64,${btoa(gradientSVG)}`;
              
              return (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: animationDelay }}
                >
                  <TiltedCard
                  imageSrc={gradientDataURL}
                  altText={feature.title}
                  captionText={feature.title}
                  containerHeight="200px"
                  containerWidth="100%"
                  imageHeight="200px"
                  imageWidth="100%"
                  rotateAmplitude={15}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={true}
                  overlayContent={
                    <div style={{ width: '100%', height: '200px' }} className="flex items-stretch">
                      <Card className="w-full h-full bg-white/70 dark:bg-black/70 backdrop-blur-xl border-white/30 dark:border-white/20 flex flex-col">
                        <CardHeader className="p-4 flex-1 flex flex-col justify-center">
                          <div className={`w-10 h-10 ${feature.iconBg} rounded-lg flex items-center justify-center mb-2 shadow-lg`}>
                            <IconComponent className={`w-5 h-5 ${feature.iconColor}`} />
                          </div>
                          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  }
                />
                </div>
              );
            })}
          </div>

          {/* Right Column - Integrations Section */}
          <div id="llms" className="flex items-stretch h-full">
            <IntegrationsSection />
          </div>

        </div>
      </div>
    </section>
  );
}
