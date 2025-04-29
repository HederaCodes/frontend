"use client";

import { motion, Variants } from "framer-motion";
import React, { ReactNode } from "react";

type AnimationProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
};

type Direction = "up" | "down" | "left" | "right";

// Fade in animation
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
  style = {},
  once = true,
}: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Fade in with slide animation
export function FadeInSlide({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 20,
  className = "",
  style = {},
  once = true,
}: AnimationProps & { direction?: Direction; distance?: number }) {
  const getDirectionOffset = () => {
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      default:
        return { y: distance };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getDirectionOffset() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Staggered animation for children
export function StaggerContainer({
  children,
  delay = 0,
  staggerDelay = 0.1,
  className = "",
  style = {},
  once = true,
}: AnimationProps & { staggerDelay?: number }) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      className={className}
      style={style}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
}

// Background gradient animation
export function GradientBackground({
  children,
  className = "",
  style = {},
}: AnimationProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={style}
      initial={{ backgroundPosition: "0% 50%" }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
}

// Button hover effect
export function AnimatedButton({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}

// Floating animation for elements
export function FloatingElement({
  children,
  className = "",
  amplitude = 10,
  duration = 4,
}: AnimationProps & { amplitude?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ 
        y: [`-${amplitude}px`, `${amplitude}px`, `-${amplitude}px`] 
      }}
      transition={{ 
        repeat: Infinity, 
        duration,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation
export function PulseElement({
  children,
  className = "",
  scale = 1.05,
  duration = 2,
}: AnimationProps & { scale?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ 
        scale: [1, scale, 1],
      }}
      transition={{ 
        repeat: Infinity, 
        duration,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Card hover effect with 3D tilt
export function Tilt3DCard({
  children,
  className = "",
  perspective = 1000,
  scale = 1.05,
}: AnimationProps & { perspective?: number; scale?: number }) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale,
        rotateX: 5,
        rotateY: 5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      style={{ perspective: `${perspective}px` }}
    >
      {children}
    </motion.div>
  );
}