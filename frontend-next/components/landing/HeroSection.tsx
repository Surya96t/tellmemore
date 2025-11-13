"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const headline = [
    "Compare AI Models.",
    "Get Better Answers."
  ];
  const subheadline =
    "Experience the power of multiple AI minds working on your questions. TellMeMore lets you compare responses from leading AI models side-by-side, helping you make better decisions faster.";
  return (
    <div className="relative w-full mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      <div className="px-4 py-5 md:py-5">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center font-bold text-zinc-900 dark:text-white">
          <span className="block text-4xl md:text-6xl lg:text-7xl mb-2 tracking-tight">
            {headline[0].split(" ").map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08, ease: "easeInOut" }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="block text-3xl md:text-5xl lg:text-6xl text-blue-600 dark:text-blue-400 font-semibold tracking-tight">
            {headline[1].split(" ").map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.08, ease: "easeInOut" }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-zinc-600 dark:text-zinc-300"
        >
          {subheadline}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="w-60">
            <Link href="/sign-up">Start Comparing Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-60">
            <Link href="/coming-soon">Watch Demo</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
