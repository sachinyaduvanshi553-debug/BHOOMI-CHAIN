# 🌏 BhoomiChain: Premium Blockchain Land Registry

![BhoomiChain Header](https://img.shields.io/badge/Status-Production--Ready-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Fabric](https://img.shields.io/badge/Blockchain-Hyperledger%20Fabric%20v2.5-orange?style=for-the-badge)

BhoomiChain is a state-of-the-art, decentralized land registry ecosystem designed to eliminate property fraud, ensure immutable title records, and streamline real estate transactions in India. Built on **Hyperledger Fabric**, it leverages Private Data Collections (PDC), IPFS, and a premium Glassmorphic UI to provide a secure and futuristic experience for citizens and authorities alike.

---

## 🚀 Key Ecosystem Features

### 💎 Phase 4: Growth & Utility (Latest)
- **Public Audit Portal**: Instant, zero-auth verification of any land asset on the blockchain.
- **Land Marketplace**: A secure, Peer-to-Peer (P2P) trading platform with atomic ownership swaps.
- **Digital Deeds with QR**: High-fidelity, printable land certificates with cryptographically-linked verification codes.
- **Interactive Asset Heatmaps**: Professional geographic visualization of land holdings directly in the dashboard.

### 🛡️ Core Security Architecture
- **Private Data Collections (PDC)**: Sensitive owner identity is restricted to authorized organizations, maintaining high privacy while keeping title status public.
- **Immutable Audit Logs**: Every operation (Registration, Transfer, Lien, Litigation) is permanently etched into the blockchain with a unique transaction hash.
- **Role-Based Access Control (RBAC)**: Distinct, secure portals for Citizens, Registrars, Banks, and Judicial Courts.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Blockchain Core** | Hyperledger Fabric v2.5.x | High-performance enterprise ledger with Raft consensus. |
| **Smart Contracts** | Node.js Chaincode | Robust business logic for title management and financial liens. |
| **Storage** | IPFS (js-ipfs/Kubo) | Decentralized storage for digital title deeds and legal PDFs. |
| **Backend API** | Express.js / Node.js | Secure gateway utilizing the Fabric Gateway SDK. |
| **Frontend UI** | React / Vite / CSS3 | Premium Glassmorphic design with fluid animations and HSL tokens. |
| **Database** | MongoDB | Persistent storage for audit logs, apps, and decentralized metadata. |

---

## 📂 Project Architecture

```text
BHOOMI-CHAIN/
├── blockchain-network/   # Fabric Network (2 Orgs, CA, Orderer, Raft)
├── chaincode/            # Smart Contract (LandRegistry.js)
├── backend/              # Production-grade Express API & Fabric Gateway
├── frontend/             # Premium React Application (Vite-based)
├── database/             # MongoDB Seeding & Data Tools
└── docs/                 # Technical Walkthroughs & Postman Collections
```

---

## 🔄 Professional Workflow

### 1. Land Initialization (The Registrar)
A Registrar office initiates the digital existence of a land parcel by "minting" it on the blockchain. They upload the physical deed to IPFS and record the CID, coordinates, and owner identity on the ledger.

### 2. Digital Ownership (The Citizen)
Citizens view their "Immutable Holdings" in a dedicated dashboard. They can generate **Digital Deeds**, view the history of their property, or **List for Sale** on the Marketplace.

### 3. Financial Oversight (The Bank)
Banks can impose or release **Financial Liens (Mortgages)**. Once a mortgage is imposed, the blockchain smart contract **automatically blocks all ownership transfers** until the bank releases the lock.

### 4. Judicial Control (The Court)
Disputed lands are marked with **Litigation Status** by the Court. This acts as a cryptographically-enforced "Stay Order," freezing the asset until the dispute is cleared.

### 5. The Marketplace (Asset Exchange)
Owners can list land for sale. A buyer can verify the title's "Clear" status via the **Public Audit Portal** and execute a purchase, which triggers an atomic ownership swap on the ledger.

---

## ⚡ Quick Start Guide

### Prerequisites
- Docker & Docker Compose
- Node.js v18+
- Hyperledger Fabric Binaries (v2.5.x)
- Linux / WSL2 Environment

### Setup Sequence

1. **Bootstrap the Network**:
   ```bash
   cd blockchain-network
   ./scripts/network-up.sh
   ```

2. **Initialize Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm start
   ```

3. **Launch Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🤝 Contribution & License
Contributions are welcome! Please ensure all code changes include corresponding documentation updates in the `docs/` folder.

**License**: Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <i>Developed with ❤️ for a more transparent and secure India.</i>
</p>
