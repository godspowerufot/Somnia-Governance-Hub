# Somnia Governance Hub

A premium, reactive DAO governance platform built on the **Somnia Blockchain**. This project leverages Somnia's unique event-driven architecture to provide real-time updates for proposals, voting, and protocol analytics without the need for constant polling.

## 🚀 Features

- **Real-Time Dashboard**: Live tracking of DAO activity using Somnia Reactivity.
- **Proposal Management**: Create, view, and fund governance proposals.
- **Interactive Analytics**: Dynamic charts showing protocol funding and participation.
- **Transparent Ledger**: Full transaction history directly from the Somnia Testnet.
- **Optimized Gas Handling**: custom gas management for the Somnia gas model.

## ⚡ Somnia Reactivity Integration

This project is a showcase of **Somnia Reactivity**, the native pub/sub system built into the blockchain.

### 1. Off-Chain Subscriptions (Frontend)
The application uses the `@somnia-chain/reactivity` SDK to receive push notifications for all governance events.

- **`useSomniaReactivity` Hook**: Initializes the Somnia SDK with the user's `PublicClient` and `WalletClient`.
- **`useProposals` Hook**: Subscribes to the `SomniaGovernance` contract. When any event (Vote, Fund, ProposalCreated) is emitted, the UI automatically refreshes the proposal list.
- **`useProposal` (Detail) Hook**: Uses **state bundling**. It subscribes to a specific proposal's events and includes a bundled `ethCall` to fetch the updated proposal state in the same notification, ensuring atomicity and zero latency.
- **Live Activity Feed**: Uses a global subscription to show every interaction with the protocol as it happens.

### 2. Verification & Testing (Backend)
The project includes specialized scripts to verify reactivity performance and data delivery.
- **`verify-reactivity.ts`**: A standalone script that demonstrates a direct WebSocket subscription to the governance contract, decoding events in real-time as they are validated on the chain.

## 🛠 Technical Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Blockchain**: [Somnia Testnet](https://somnia.network/)
- **Wallet/Network Connectivity**: [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/)
- **Styling**: Vanilla CSS with a focus on "Minimal-Modern" aesthetics.
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- [Somnia Testnet Explorer](https://shannon-explorer.somnia.network/)
- Min Balance: 32 STT (for on-chain operations)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Testing
To verify reactivity and governance flows:
```bash
npm test
```

## 📜 Contract Details (Testnet)
- **Governance Contract**: `0xd45b60a393defaca9be87329d4a927357eb846bf`
- **Chain ID**: `50312`
- **RPC**: `https://api.infra.testnet.somnia.network`

---

Built with ❤️ for the Somnia Ecosystem.
