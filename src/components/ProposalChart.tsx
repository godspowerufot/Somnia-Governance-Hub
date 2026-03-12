'use client';

import React from 'react';

interface ProposalChartProps {
    current: bigint;
    goal: bigint;
    size?: number;
    strokeWidth?: number;
}

export default function ProposalChart({ current, goal, size = 160, strokeWidth = 8 }: ProposalChartProps) {
    const percentage = Number(goal) > 0 ? (Number(current) / Number(goal)) * 100 : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-white/5"
                />
                {/* Progress Bar */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset }}
                    strokeLinecap="round"
                    className="text-accent transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-mono font-bold">{Math.round(percentage)}%</span>
                <span className="text-[10px] text-white/40 tracking-widest uppercase mt-1">Funded</span>
            </div>
        </div>
    );
}
