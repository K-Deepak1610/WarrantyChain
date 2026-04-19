# 🔗 WarrantyChain  
### Enterprise-Grade Blockchain Digital Warranty & Ownership System

WarrantyChain is a professional Web3 decentralized application (dApp) that provides immutable storage for product warranties and ownership. Built on a local **Ganache** blockchain, it features a high-end user interface with real-time transaction tracking, QR-based verification, and secure asset transfers.

## ✨ Key Enhancements (Latest Version)

- **⚡ Professional Transaction UX**: Instant UI feedback during blockchain interactions ("Awaiting Wallet Signature", "Broadcasting to Ganache").
- **🧾 Smart Success Receipts**: Detailed transaction cards showing Action Type, Product ID, and actual Product Name fetched from the chain.
- **🔍 Real-Time Name Lookup**: Automatic blockchain verification of product identity during ownershp transfers.
- **🛡️ Rebranded "Verify Warranty"**: A dedicated, security-focused verification portal with data-rich manifests and "Blockchain Verified" status indicators.
- **🎨 Premium Aesthetics**: Sleek dark mode design with glassmorphism, pulse animations, and smooth state transitions.

---

## 🚀 Features

- **🔐 Secure Blockchain Storage**: Implemented via Solidity Smart Contracts.
- **🧾 Digital Warranty Registration**: Permanent, tamper-proof product records.
- **👤 Ownership Verification**: Instant public lookup for any product identifier.
- **🔄 Secure Ownership Transfer**: Multi-stage transfer flow with automatic name validation.
- **📜 Ownership History**: Complete, transparent timeline of asset changes.
- **📅 Smart Warranty Calculation**: Dynamic calculation of remaining coverage days.
- **📱 QR-Based Portal**: Mobile-ready verification page accessible via QR code.
- **📄 Official PDF Export**: Generate and download secure verification certificates.
- **💳 MetaMask Integration**: Seamless connection with automated Ganache network switching.

---

## 🏗️ Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS & Vanilla CSS
- Framer Motion (State-aware animations)
- Ethers.js v6

**Blockchain**
- Solidity (Smart Contract)
- Hardhat (Development Environment)
- **Ganache Local** (Persistent Blockchain Node)

**Wallet**
- MetaMask

**Document Engine**
- jsPDF (Secure Certificate Generation)

---

## ⚙️ How It Works

1. **Register Product**: Enter details to mint a unique warranty record on the blockchain.
2. **Verify Warranty**: Search by Product ID to view real-time registry data and validity status.
3. **Transfer Ownership**: Securely hand over product rights to a new wallet address.
4. **QR Scan**: Use the generated QR to access the public verification page without needing a wallet.
5. **Download Certificate**: Export a "Blockchain Verified" PDF for physical documentation.

---

## 🚀 Local Setup with Ganache

### 1️⃣ Clone & Install

```bash
git clone https://github.com/K-Deepak1610/WarrantyChain.git
cd WarrantyChain
npm install
cd frontend
npm install
```

### 2️⃣ Start Ganache
- Open **Ganache UI** (Workspace) or run `ganache-cli`.
- Ensure RPC is set to `http://127.0.0.1:7545`.
- Chain ID: `1337`.

### 3️⃣ Deploy Smart Contract
From the project root:
```bash
npx hardhat run scripts/deploy.js --network ganache
```
*Note: Ensure your Hardhat config points to `7545`.*

### 4️⃣ Configure MetaMask
- Add a Custom Network: **Ganache Local**.
- RPC URL: `http://127.0.0.1:7545`.
- Chain ID: `1337`.
- Currency: `ETH`.

### 5️⃣ Run the App
```bash
cd frontend
npm run dev
```

---

## 🎥 Demo & Learning

Watch the initial project demonstration and logic overview:

👉 [Project Overview Video](https://youtu.be/1oRe3pQXAGk)

---

## 🔐 Smart Contract Security

- **Duplicate Prevention**: Product IDs are unique and cannot be re-registered.
- **Owner-Only Transfers**: Transactions must be signed by the current legitimate owner.
- **Immutable Log**: All state changes emit blockchain events for transparent auditing.
- **Dynamic Validity**: Warranty status is calculated against the current block timestamp.

---

## 📜 License

This project is for educational and enterprise-demonstration purposes. All rights reserved.
