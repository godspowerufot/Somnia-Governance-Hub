'use client';

import React, { useMemo } from 'react';
import { ChartPoint } from '@/hooks/useProposals';

interface GlobalActivityChartProps {
    data: ChartPoint[];
    loading: boolean;
    height?: number;
}

export function GlobalActivityChart({ data, loading, height = 240 }: GlobalActivityChartProps) {
    const points = useMemo(() => {
        if (data.length < 2) return [];

        const minTime = data[0].timestamp;
        const maxTime = data[data.length - 1].timestamp;
        const minValue = 0; // Start from 0 for cumulative funding
        const maxValue = Math.max(...data.map(p => p.value)) * 1.1; // 10% padding

        const timeRange = maxTime - minTime || 1;
        const valueRange = maxValue - minValue || 1;

        return data.map(p => ({
            x: ((p.timestamp - minTime) / timeRange) * 100,
            y: 100 - ((p.value - minValue) / valueRange) * 100,
            value: p.value,
            timestamp: p.timestamp
        }));
    }, [data]);

    const pathData = useMemo(() => {
        if (points.length < 2) return '';
        return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    }, [points]);

    const areaData = useMemo(() => {
        if (points.length < 2) return '';
        return `${pathData} L 100,100 L 0,100 Z`;
    }, [points, pathData]);

    if (loading && data.length === 0) {
        return (
            <div className="w-full bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-center overflow-hidden" style={{ height }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Syphoning Network Data...</span>
                </div>
            </div>
        );
    }

    if (data.length < 2) {
        return (
            <div className="w-full bg-white/[0.01] border border-white/5 rounded-xl flex flex-col items-center justify-center" style={{ height }}>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2 font-bold">Pulse Detected: UNSTABLE</p>
                <p className="text-[9px] font-mono text-white/10 uppercase tracking-tighter">Insufficient historical data to render trajectory</p>
            </div>
        );
    }

    const currentTotal = data[data.length - 1].value.toLocaleString(undefined, { maximumFractionDigits: 2 });

    return (
        <div className="w-full card-minimal p-0 bg-white/[0.01] border-white/5 overflow-hidden group">
            <div className="p-8 flex justify-between items-start border-b border-white/5">
                <div>
                    <h3 className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1">Cumulative Growth</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tighter">{currentTotal}</span>
                        <span className="text-xs font-mono text-accent">STT</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest block mb-1">Activity Density</span>
                    <span className="text-xs font-mono text-white/60">{data.length} EVENTS</span>
                </div>
            </div>

            <div className="relative w-full" style={{ height: height - 80 }}>
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                >
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Background Grid Lines */}
                    {[25, 50, 75].map(line => (
                        <line
                            key={line}
                            x1="0"
                            y1={line}
                            x2="100"
                            y2={line}
                            stroke="white"
                            strokeOpacity="0.03"
                            strokeWidth="0.1"
                        />
                    ))}

                    {/* Area fill */}
                    <path
                        d={areaData}
                        fill="url(#chartGradient)"
                        className="transition-all duration-1000 ease-out"
                    />

                    {/* Line path */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.3)]"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Current point indicator */}
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="3"
                        fill="var(--accent)"
                        className="animate-pulse shadow-[0_0_15px_rgba(var(--accent-rgb),0.8)]"
                    />
                </svg>

                {/* Subtle Y-Axis indicator */}
                <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between text-[8px] font-mono text-white/10 pointer-events-none uppercase">
                    <span>MAX</span>
                    <span>MID</span>
                    <span>BASE</span>
                </div>
            </div>

            {/* X-Axis / Footer */}
            <div className="px-8 py-4 flex justify-between items-center bg-white/[0.02] border-t border-white/5">
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Evolution Timeline</span>
                <div className="flex gap-4">
                    <span className="px-2 py-0.5 rounded border border-accent/20 text-accent text-[8px] font-mono">REACTIVE DATA STREAM</span>
                </div>
            </div>
        </div>
    );
}
