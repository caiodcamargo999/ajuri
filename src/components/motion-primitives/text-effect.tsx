"use client";
import React from "react";
import { motion, Variants } from "motion/react";

interface TextEffectProps {
    children: string;
    as?: React.ElementType;
    preset?: "fade-in-blur" | "scale";
    per?: "word" | "char" | "line";
    className?: string;
    delay?: number;
    speedSegment?: number;
}

export function TextEffect({
    children,
    as: Component = "p",
    preset = "fade-in-blur",
    per = "word",
    className,
    delay = 0,
    speedSegment = 0.05,
}: TextEffectProps) {
    const words = children.split(" ");

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: {
                staggerChildren: speedSegment,
                delayChildren: delay,
            },
        }),
    };

    const child: Variants = {
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            filter: "blur(20px)",
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            style={{ display: "inline-block" }} // or flex wrap if words need to break
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {/* Simple implementation: just render text. For full word/char splitting we need more logic. 
            For now, let's just animate the whole block or words if convenient.
            Actually, let's implement word splitting for the effect.
        */}
            <Component className="inline-block">
                {words.map((word, index) => (
                    <motion.span variants={child} key={index} className="inline-block mr-[0.25em] last:mr-0">
                        {word}
                    </motion.span>
                ))}
            </Component>
        </motion.div>
    );
}
