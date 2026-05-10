
import React from 'react';

interface Scale16SolidIconProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
    background?: string;
    opacity?: number;
    rotation?: number;
    shadow?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    padding?: number;
    className?: string; // Add className prop for better integration
}

export const Scale16SolidIcon = ({
    size = 24, // Default to 24 for icon standard
    color = 'currentColor', // Default to currentColor to inherit from parent
    strokeWidth = 2,
    background = 'transparent',
    opacity = 1,
    rotation = 0,
    shadow = 0,
    flipHorizontal = false,
    flipVertical = false,
    padding = 0,
    className
}: Scale16SolidIconProps) => {
    const transforms = [];
    if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
    if (flipHorizontal) transforms.push('scaleX(-1)');
    if (flipVertical) transforms.push('scaleY(-1)');

    const viewBoxSize = 24 + (padding * 2);
    const viewBoxOffset = -padding;
    const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16" // Adjusted viewBox for 16x16 icon based on name, but path looks like 16 size? Let's check path. The path coordinates go up to ~14, so 16x16 is likely correct for standard or 24x24 depending on source. Let's try standardizing to the provided viewBox logic if dynamic, or stick to provided. The user code had dynamic viewBox. I will stick to his logic but standard 24 if path allows.
            // Wait, the user path has coordinates like "8.75 2.5", "12 9.5". This fits in 16x16 neatly.
            // Let's use 16x16 as base.
            width={size}
            height={size}
            fill="currentColor" // The user asked for "Scale16Solid", usually implies fill. The provided code has fill="none" but path fill="currentColor".
            className={className}
            style={{
                opacity,
                transform: transforms.join(' ') || undefined,
                filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
                backgroundColor: background !== 'transparent' ? background : undefined
            }}
        >
            <path fillRule="evenodd" d="M8.75 2.5a.75.75 0 0 0-1.5 0v.508a33 33 0 0 0-4.624.434a.75.75 0 0 0 .246 1.48l.13-.021l-1.188 4.75a.75.75 0 0 0 .33.817A3.5 3.5 0 0 0 4 11a3.5 3.5 0 0 0 1.856-.532a.75.75 0 0 0 .33-.818l-1.25-5a31 31 0 0 1 2.314-.141v7.503q-1.324.042-2.607.226a.75.75 0 0 0 .213 1.485a22.2 22.2 0 0 1 6.288 0a.75.75 0 1 0 .213-1.485a24 24 0 0 0-2.607-.226V4.509q1.168.028 2.314.14L9.814 9.65a.75.75 0 0 0 .329.818a3.5 3.5 0 0 0 1.856.532a3.5 3.5 0 0 0 1.856-.532a.75.75 0 0 0 .33-.818L12.997 4.9l.13.022a.75.75 0 1 0 .247-1.48a33 33 0 0 0-4.624-.434zM3.42 9.415a2 2 0 0 0 1.16 0L4 7.092zM12 9.5a2 2 0 0 1-.582-.085L12 7.092l.58 2.323A2 2 0 0 1 12 9.5" clipRule="evenodd" />
        </svg>
    );
};
