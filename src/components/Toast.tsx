'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ExternalLink, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    link?: {
        label: string;
        url: string;
    };
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, link?: { label: string; url: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType, link?: { label: string; url: string }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, link }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto flex items-start gap-4 p-5 rounded-2xl bg-black border border-white/10 shadow-2xl shadow-white/5 min-w-[320px] max-w-[480px] animate-in slide-in-from-right duration-300"
                    >
                        <div className="mt-1">
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-white" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-white/40" />}
                            {toast.type === 'info' && <Info className="w-5 h-5 text-white/60" />}
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-medium text-white leading-relaxed">
                                {toast.message}
                            </p>
                            {toast.link && (
                                <a
                                    href={toast.link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-white/40 hover:text-white tracking-widest uppercase transition-colors"
                                >
                                    {toast.link.label}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/20 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
