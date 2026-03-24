import React from "react";
import { motion } from "framer-motion";

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export function PageMotion({ children }) {
  return (
    <motion.div
      className="app-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="page-container">{children}</div>
    </motion.div>
  );
}

export function AnimatedSection({ children, delay = 0 }) {
  return (
    <motion.div
      className="section-card"
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.35, delay }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ children, delay = 0 }) {
  return (
    <motion.div
      className="list-item"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      whileHover={{ y: -3 }}
    >
      {children}
    </motion.div>
  );
}