"use client";
import React from "react";
import { motion, Variants } from "framer-motion";

interface AnimatedGroupProps {
    children: React.ReactNode;
    variants?: {
        container?: Variants;
        item?: Variants;
    };
    className?: string;
}

export function AnimatedGroup({ children, variants, className }: AnimatedGroupProps) {
    const defaultContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const defaultItem: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={variants?.container || defaultContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={className}
        >
            {React.Children.map(children, (child) => (
                <motion.div variants={variants?.item || defaultItem}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}
