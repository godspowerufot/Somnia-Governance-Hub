import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Somnia DAO",
    description: "Minimalistic Web3 DAO on Somnia Blockchain",
};

import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { ToastProvider } from "@/components/Toast";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <ToastProvider>
                        <div className="min-h-screen flex flex-col">
                            <Navbar />
                            <main className="flex-1">
                                {children}
                            </main>
                        </div>
                    </ToastProvider>
                </Providers>
            </body>
        </html>
    );
}
