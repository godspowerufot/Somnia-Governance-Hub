export default function DashboardPage() {
    const activities = [
        { id: 1, text: "0x12...4A voted YES on Proposal #3", time: "2 mins ago" },
        { id: 2, text: "0x91...7F funded 10 SOMNIA", time: "5 mins ago" },
        { id: 3, text: "0x33...DD created a proposal", time: "12 mins ago" },
    ];

    const statusTable = [
        { id: 1, name: "Build Analytics", funding: "42%", votes: "90", status: "Active" },
        { id: 2, name: "DAO Governance", funding: "100%", votes: "195", status: "Funded" },
        { id: 3, name: "Liquidity Pool", funding: "12%", votes: "12", status: "Active" },
    ];

    return (
        <main className="container-minimal py-12">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">DAO Dashboard</h1>
                    <p className="text-white/50">Real-time governance and funding monitoring.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <span className="text-xs text-white/40 block uppercase font-bold">Network</span>
                        <span className="text-accent font-mono">Somnia Testnet</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-xs font-bold text-white/40 mb-6 tracking-widest uppercase">Proposal Status</h2>
                        <div className="border overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-white/5 font-mono">
                                    <tr>
                                        <th className="px-6 py-4">PROPOSAL</th>
                                        <th className="px-6 py-4">FUNDING</th>
                                        <th className="px-6 py-4">VOTES</th>
                                        <th className="px-6 py-4">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {statusTable.map((row) => (
                                        <tr key={row.id}>
                                            <td className="px-6 py-4 font-bold">{row.name}</td>
                                            <td className="px-6 py-4 font-mono">{row.funding}</td>
                                            <td className="px-6 py-4 font-mono">{row.votes}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold border ${row.status === 'Funded' ? 'border-accent text-accent' : 'border-white/20 text-white/60'}`}>
                                                    {row.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xs font-bold text-white/40 mb-6 tracking-widest uppercase">Live Activity</h2>
                        <div className="space-y-4">
                            {activities.map((act) => (
                                <div key={act.id} className="card-minimal !p-4 border-white/10 flex flex-col gap-1">
                                    <p className="text-sm">{act.text}</p>
                                    <span className="text-[10px] font-mono text-white/30">{act.time}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
