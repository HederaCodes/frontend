"use client";

import { useEffect, useRef, Children, isValidElement, cloneElement, Fragment, ReactElement, JSXElementConstructor } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  delay?: number;
  duration?: number;
  triggerOnce?: boolean;
  wordWise?: boolean;
}

export function TextReveal({
  children,
  className = "",
  stagger = 0.05,
  y = 100,
  delay = 0,
  duration = 1,
  triggerOnce = true,
  wordWise = false,
}: TextRevealProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<Array<HTMLSpanElement | null>>([]);
  
  // Reset words ref array when component re-renders
  useEffect(() => {
    wordsRef.current = [];
  }, [children]);
  
  // Process children to wrap words in spans for animation
  const processChildren = (children: React.ReactNode): React.ReactNode => {
    return Children.map(children, child => {
      // If child is text, split it into words/chars
      if (typeof child === 'string') {
        if (wordWise) {
          // Split by words
          const words = child.split(' ');
          return words.map((word, i) => (
            <Fragment key={i}>
              <span className="inline-block overflow-hidden">
                <span ref={(el) => {
                  if (el) {
                    wordsRef.current.push(el);
                  }
                }} className="inline-block">
                  {word}
                </span>
              </span>
              {i !== words.length - 1 ? ' ' : ''}
            </Fragment>
          ));
        } else {
          // Split by characters
          return child.split('').map((char, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <span ref={(el) => {
                if (el) {
                  wordsRef.current.push(el);
                }
              }} className="inline-block">
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          ));
        }
      }
      // If child is a valid React element
      if (isValidElement(child)) {
        const element = child as ReactElement<{ children?: React.ReactNode }, string | JSXElementConstructor<unknown>>;
        
        return cloneElement(
          element,
          {},
          element.props.children ? processChildren(element.props.children) : null
        );
      }
      return child;
    });
  };
  
  useEffect(() => {
    if (!textRef.current) return;
    
    const elements = wordsRef.current.filter(Boolean); // Filter out any null elements
    
    // Initial state (hidden)
    gsap.set(elements, { 
      y,
      opacity: 0
    });
    
    // Reveal animation with ScrollTrigger
    gsap.to(elements, {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: textRef.current,
        start: "top bottom-=100",
        toggleActions: triggerOnce ? "play none none none" : "play none none reset"
      }
    });
    
    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [y, stagger, delay, duration, triggerOnce]);
  
  return (
    <div ref={textRef} className={className}>
      {processChildren(children)}
    </div>
  );
}

interface CodeLineRevealProps {
  code: string;
  className?: string;
  language?: string;
  delay?: number;
  duration?: number;
  lineHeight?: number;
}

export function CodeLineReveal({
  code,
  className = "",
  delay = 0.1,
  duration = 0.5,
  lineHeight = 1.5
}: CodeLineRevealProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  
  useEffect(() => {
    if (!codeRef.current) return;
    
    const lines = codeRef.current.querySelectorAll('.line');
    
    gsap.fromTo(
      lines,
      { 
        opacity: 0,
        x: -20
      },
      {
        opacity: 1,
        x: 0,
        duration,
        stagger: 0.05,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: codeRef.current,
          start: "top bottom-=50",
          toggleActions: "play none none none"
        }
      }
    );
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [code, delay, duration]);
  
  return (
    <pre 
      ref={codeRef} 
      className={`overflow-x-auto ${className}`}
      style={{ lineHeight }}
    >
      {code.split('\n').map((line, i) => (
        <div key={i} className="line">
          {line || ' '}
        </div>
      ))}
    </pre>
  );
}