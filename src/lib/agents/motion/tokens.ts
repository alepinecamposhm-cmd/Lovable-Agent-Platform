export const duration = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  emphasis: 600,
} as const;

export const easing = {
  easeOut: [0.16, 1, 0.3, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: { type: "spring" as const, stiffness: 400, damping: 30 },
  springBouncy: { type: "spring" as const, stiffness: 300, damping: 20 },
  linear: [0, 0, 1, 1],
} as const;

export const distance = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const;

// Framer Motion Variants
export const fadeInUp = {
  initial: { opacity: 0, y: distance.sm },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: distance.sm },
  transition: { duration: duration.normal / 1000 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: duration.fast / 1000 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: duration.normal / 1000 },
};

export const slideInRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const slideInLeft = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: duration.slow / 1000, ease: easing.easeOut },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: distance.sm },
  visible: { opacity: 1, y: 0 },
};

export const hoverLift = {
  whileHover: { y: -distance.xs, transition: { duration: duration.fast / 1000 } },
};

export const tapScale = {
  whileTap: { scale: 0.98 },
};

export const buttonMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: duration.fast / 1000 },
};
