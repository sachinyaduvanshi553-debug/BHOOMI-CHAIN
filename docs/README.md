# BhoomiChain – Blockchain-Based Land Registry

India-focused decentralized land registry system built on **Hyperledger Fabric** to prevent land disputes and ensure tamper-proof ownership records.

## System Architecture

1.  **Blockchain Layer**: Hyperledger Fabric (2.5.x) with Raft consensus. Two Organizations: Revenue Org & Registrar Org.
2.  **Smart Contracts**: Node.js chaincode (lib/landRegistry.js) enforcing business rules (e.g., no transfer if mortgaged).
3.  **Backend**: Node.js + Express with Fabric Gateway SDK integration.
4.  **Frontend**: React (Vite) with role-based dashboards (Citizen, Registrar, Bank, Court).
5.  **Storage**: IPFS (simulated content hashes) for document storage.
6.  **Database**: MongoDB for audit logs, user authentication, and application tracking.

## Project Structure

```text
bhoomichain/
├── blockchain-network/   # Fabric config, docker-compose, setup scripts
├── chaincode/            # Node.js smart contract (LandRegistry)
├── backend/              # Express API server & Fabric Gateway
├── frontend/             # React (Vite) dashboards
├── database/             # MongoDB seed scripts
└── docs/                 # Documentation
```

## Setup Instructions

### 1. Hyperledger Fabric Network (Linux/WSL2 Required)
Ensure you have Docker, Docker Compose, and Fabric v2.5.x binaries installed.

```bash
cd blockchain-network
chmod +x scripts/*.sh
./scripts/network-up.sh
```

### 2. Backend API
```bash
cd backend
npm install
cp .env.example .env   # Update with your local paths
npm start
```

### 3. Database Seeding
```bash
cd database
npm install
node seed.js
```

### 4. Frontend Application
```bash
cd frontend
npm install
npm run dev
```

## API Testing (Postman)

A pre-configured Postman collection is available in:
`docs/BhoomiChain.postman_collection.json`

1.  **Import**: Open Postman and import the JSON file.
2.  **Base URL**: The collection uses a `{{baseUrl}}` variable set to `http://localhost:5000`.
3.  **Auth**:
    - Run the **Login** request for a specific role (e.g., Citizen).
    - Copy the `token` from the response.
    - Update the `{{jwtToken}}` variable in the collection's "Variables" tab.
4.  **Execute**: Run any of the 7 land operations.

## User Credentials (Demo)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Citizen** | ramesh@bhoomichain.in | Citizen@1234 |
| **Registrar** | anita@bhoomichain.in | Registrar@1234 |
| **Bank Authority** | bank@bhoomichain.in | Bank@1234 |
| **Court Authority** | court@bhoomichain.in | Court@1234 |

## Key Features
- **Immutability**: Real-time ownership updates on a permissioned ledger.
- **Business Logic Enforced on Chain**: Transfers automatically blocked if asset has a bank lien or active court case.
- **Audit Trail**: Full history query of land parcels directly from blockchain state.
- **RBAC**: Secure access control ensuring only authorized entities can perform specific operations.
