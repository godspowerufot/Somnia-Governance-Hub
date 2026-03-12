import Link from "next/link";
import ConnectButton from "./ConnectButton";

export default function Navbar() {
    return (
        <nav className="border-b bg-black sticky top-0 z-50">
            <div className="container-minimal h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-tighter">
                    Somnia DAO
                </Link>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <Link href="/proposals" className="hover:text-white transition-colors">Archive</Link>
                        <Link href="/create" className="hover:text-white transition-colors">Create</Link>
                    </div>

                    <ConnectButton />
                </div>
            </div>
        </nav>
    );
}

