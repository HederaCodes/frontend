"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { FadeInSlide, StaggerContainer } from "./components/animations/MotionWrapper";
import { TextReveal } from "./components/animations/GsapText";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Ref for animated gradient background
  const bgRef = useRef<HTMLDivElement>(null);
  
  // Animated background effect
  useEffect(() => {
    if (!bgRef.current) return;
    
    const animation = gsap.to(bgRef.current, {
      backgroundPosition: "100% 100%",
      duration: 15,
      ease: "linear",
      repeat: -1,
      yoyo: true
    });
    
    // Show content after initial animation
    setIsLoaded(true);
    
    return () => {
      animation.kill();
    };
  }, []);

  return (
    <div 
      ref={bgRef} 
      className="bg-[size:200%_200%] min-h-screen relative"
      style={{
        backgroundImage: "radial-gradient(circle at 30% 30%, rgba(30, 64, 175, 0.6), transparent), radial-gradient(circle at 70% 70%, rgba(91, 33, 182, 0.6), transparent), linear-gradient(to bottom right, rgb(17, 24, 39), rgb(88, 28, 135))"
      }}
    >
      {/* Particles overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5 backdrop-blur-md"
            style={{
              width: Math.random() * 60 + 10,
              height: Math.random() * 60 + 10,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              y: [0, -Math.random() * 100 - 50],
              scale: [1, Math.random() * 0.4 + 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: Math.random() * 10 + 15,
              delay: Math.random() * 10,
              ease: "linear",
            }}
          />
        ))}
        
        {/* Grid lines */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)',
        }} />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center max-w-5xl mx-auto pt-20"
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Pre-title */}
          <motion.div 
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1 mb-6 text-sm text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="flex h-2 w-2 mr-2">
              <span className="animate-ping absolute h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Introducing AI-Powered Code Replication
          </motion.div>
          
          {/* Main title with premium styling */}
          <div className="mb-6 relative">
            <TextReveal 
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
              stagger={0.03}
            >
              <span className="inline-block relative">
                <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text">Hedera</span>
              </span>
              <span className="text-blue-400">Codes</span>
            </TextReveal>
            
            {/* Animated underline */}
            <motion.div
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-24 mx-auto mt-4"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "6rem", opacity: 1 }}
              transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
            />
          </div>
          
          <motion.p 
            className="mt-8 text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            Your personalized AI assistant that learns from your coding style and helps generate code
            <span className="font-medium italic text-white"> exactly </span>
            the way you would write it.
          </motion.p>
          
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row gap-5 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Link href="/train" className="btn-primary flex items-center justify-center gap-2 group sm:min-w-[180px]">
              <span>Start Training</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            
            <Link href="/live" className="btn-secondary flex items-center justify-center gap-2 group sm:min-w-[180px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>Live Demo</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-indigo-950/70">
        <div className="max-w-7xl mx-auto">
          <FadeInSlide className="mb-16 text-center">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">How it works</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">Your Code, <span className="bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">Your Style</span></h2>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">HederaCodes uses advanced AI to understand your unique coding patterns and preferences</p>
          </FadeInSlide>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="p-8 backdrop-blur-md">
              <div className="mb-5 bg-gradient-to-br from-blue-400 to-indigo-600 w-14 h-14 rounded-full flex items-center justify-center ring-4 ring-blue-600/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2 flex items-center">
                <span className="text-blue-300 mr-2">01.</span>
                Train
              </h3>
              <p className="text-white/70 leading-relaxed">Upload your code files and let HederaCodes analyze your unique coding style, patterns, and preferences. The more examples you provide, the more accurate the AI becomes.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-8 backdrop-blur-md">
              <div className="mb-5 bg-gradient-to-br from-purple-400 to-pink-600 w-14 h-14 rounded-full flex items-center justify-center ring-4 ring-purple-600/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2 flex items-center">
                <span className="text-purple-300 mr-2">02.</span>
                Interact
              </h3>
              <p className="text-white/70 leading-relaxed">Test HederaCodes by providing code challenges or requirements. Watch as it generates code that mirrors your style, formatting preferences, naming conventions, and problem-solving approaches.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="p-8 backdrop-blur-md">
              <div className="mb-5 bg-gradient-to-br from-teal-400 to-green-600 w-14 h-14 rounded-full flex items-center justify-center ring-4 ring-teal-600/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2 flex items-center">
                <span className="text-teal-300 mr-2">03.</span>
                Create
              </h3>
              <p className="text-white/70 leading-relaxed">Boost your productivity with an AI assistant that thinks and codes like you. Use HederaCodes to generate boilerplate, solve complex problems, or prototype new features—all in your signature style.</p>
            </div>
          </StaggerContainer>
          
          {/* Code demo */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <FadeInSlide direction="right" once={false}>
              <div className="space-y-6">
                <span className="badge badge-blue">LIVE PREVIEW</span>
                <h3 className="text-3xl font-bold text-white">Code That Feels Like <span className="text-blue-300">Your Own</span></h3>
                <p className="text-white/70 leading-relaxed">
                  HederaCodes doesn&apos;t just generate generic solutions. It learns your unique coding fingerprint—from your preferred variable naming to your approach to error handling and commenting style.
                </p>
                <ul className="space-y-2">
                  {[
                    "Personalized naming conventions",
                    "Your preferred code structure",
                    "Customized error handling patterns",
                    "Comment style and documentation approach",
                    "Consistent with your programming paradigms"
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      className="flex items-center gap-2 text-white/90"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <svg className="min-w-4 w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <div>
                  <Link href="/train" className="text-blue-300 font-medium flex items-center gap-1 group hover:text-blue-200">
                    <span>Start training your AI</span>
                    <svg 
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </FadeInSlide>
            
            <FadeInSlide direction="left" once={false} delay={0.3}>
              <div className="code-block rounded-xl overflow-hidden bg-slate-900 border border-slate-700/50 shadow-2xl shadow-blue-900/10">
                {/* Code editor header */}
                <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-xs text-slate-400">generatedCode.js</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Your style</span>
                  </div>
                </div>
                
                {/* Code content */}
                <div className="px-4 py-5 font-mono text-sm text-slate-300 overflow-auto" style={{ maxHeight: "400px" }}>
                  <pre className="leading-relaxed">
                    <motion.span 
                      className="block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <span className="text-slate-500">/&#42;&#42;</span>
                    </motion.span>
                    <motion.span 
                      className="block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <span className="text-slate-500"> * Processes user data according to specified requirements.</span>
                    </motion.span>
                    <motion.span 
                      className="block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <span className="text-slate-500"> * </span>
                    </motion.span>
                    <motion.span 
                      className="block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <span className="text-slate-500"> * @param {"{Object}"} userData - The user data to process</span>
                    </motion.span>
                    <motion.span 
                      className="block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      <span className="text-slate-500"> * @param {"{Object}"} options - Processing options</span>
                    </motion.span>
                    <motion.span 
                      className="block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      <span className="text-slate-500"> * @returns {"{Object}"} Processed data</span>
                    </motion.span>
                    <motion.span 
                      className="block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.1, duration: 0.5 }}
                    >
                      <span className="text-slate-500"> */</span>
                    </motion.span>
                    <motion.span 
                      className="block mt-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    >
                      <span className="text-blue-300">function</span> <span className="text-yellow-200">processUserData</span>(userData, options = {"{}"}) {"{"}
                    </motion.span>
                    <motion.span 
                      className="block pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.3, duration: 0.5 }}
                    >
                      <span className="text-blue-300">const</span> {"{"}
                    </motion.span>
                    <motion.span 
                      className="block pl-8"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.4, duration: 0.5 }}
                    >
                      sanitizeInput = <span className="text-orange-300">true</span>,
                    </motion.span>
                    <motion.span 
                      className="block pl-8"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    >
                      normalizeOutput = <span className="text-orange-300">false</span>,
                    </motion.span>
                    <motion.span 
                      className="block pl-8"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.6, duration: 0.5 }}
                    >
                      debug = <span className="text-orange-300">false</span>
                    </motion.span>
                    <motion.span 
                      className="block pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.7, duration: 0.5 }}
                    >
                      {"}"} = options;
                    </motion.span>
                    <motion.span 
                      className="block mt-3 pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.8, duration: 0.5 }}
                    >
                      {/* Input validation */}
                    </motion.span>
                    <motion.span 
                      className="block pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.9, duration: 0.5 }}
                    >
                      <span className="text-blue-300">if</span> (!userData || <span className="text-blue-300">typeof</span> userData !== <span className="text-green-300">&apos;object&apos;</span>) {"{"}
                    </motion.span>
                    <motion.span 
                      className="block pl-8"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2, duration: 0.5 }}
                    >
                      <span className="text-red-300">throw</span> <span className="text-blue-300">new</span> <span className="text-yellow-200">Error</span>(<span className="text-green-300">&apos;Invalid user data provided&apos;</span>);
                    </motion.span>
                    <motion.span 
                      className="block pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.1, duration: 0.5 }}
                    >
                      {"}"}
                    </motion.span>
                    <motion.span 
                      className="block mt-3 pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.2, duration: 0.5 }}
                    >
                      debug && <span className="text-yellow-200">console</span>.<span className="text-blue-300">log</span>(<span className="text-green-300">&apos;Processing user data:&apos;</span>, userData);
                    </motion.span>
                    <motion.span 
                      className="block mt-3 pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.3, duration: 0.5 }}
                    >
                      {/* Apply processing logic */}
                    </motion.span>
                    <motion.span 
                      className="block pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.4, duration: 0.5 }}
                    >
                      <span className="text-blue-300">const</span> processedData = sanitizeInput
                    </motion.span>
                    <motion.span 
                      className="block pl-8"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.5, duration: 0.5 }}
                    >
                      ? <span className="text-yellow-200">_sanitizeUserData</span>(userData)
                    </motion.span>
                    <motion.span 
                      className="block pl-8"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.6, duration: 0.5 }}
                    >
                      : {"{"} ...userData {"}"};
                    </motion.span>
                    <motion.span 
                      className="block mt-3 pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.7, duration: 0.5 }}
                    >
                      <span className="text-blue-300">return</span> {"{"}
                    </motion.span>
                    <motion.span 
                      className="block pl-8"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.8, duration: 0.5 }}
                    >
                      ...processedData,
                    </motion.span>
                    <motion.span 
                      className="block pl-8"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.9, duration: 0.5 }}
                    >
                      processedAt: <span className="text-blue-300">new</span> <span className="text-yellow-200">Date</span>().<span className="text-blue-300">toISOString</span>(),
                    </motion.span>
                    <motion.span 
                      className="block pl-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 3, duration: 0.5 }}
                    >
                      {"}"};
                    </motion.span>
                    <motion.span 
                      className="block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 3.1, duration: 0.5 }}
                    >
                      {"}"}
                    </motion.span>
                  </pre>
                </div>
              </div>
            </FadeInSlide>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <FadeInSlide>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to meet your <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">digital coding twin</span>?</h2>
            <p className="text-xl text-white/70 mb-10 max-w-3xl mx-auto">Start training your personalized AI assistant today and experience the future of coding. HederaCodes adapts to your style, not the other way around.</p>
            
            <Link 
              href="/train"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-lg shadow-lg shadow-blue-900/30 text-lg font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/40"
            >
              <span>Get Started for Free</span>
              <motion.svg
                className="ml-2 w-5 h-5"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </motion.svg>
            </Link>
            
            <div className="mt-6 text-white/50 text-sm">No credit card required</div>
          </FadeInSlide>
        </div>
      </section>
    </div>
  );
}
