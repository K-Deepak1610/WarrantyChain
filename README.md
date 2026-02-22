# 🔗 WarrantyChain  
### Blockchain-Based Digital Warranty & Ownership Verification System

WarrantyChain is a decentralized Web3 application that securely stores product warranty and ownership details on the blockchain.  
It enables instant verification, fraud prevention, QR-based validation, and secure ownership transfer.

## 🚀 Features

- 🔐 Secure blockchain storage (Solidity Smart Contract)
- 🧾 Digital warranty registration
- 👤 Ownership verification
- 🔄 Secure ownership transfer
- 📜 Ownership history timeline
- 📅 Warranty validity & days remaining calculation
- 📱 QR-based product verification
- 📄 Downloadable verification certificate (PDF)
- 💳 MetaMask wallet integration
- 🌐 Public verification page (via QR link)

---

## 🏗️ Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Framer Motion
- Ethers.js

**Blockchain**
- Solidity
- Hardhat
- Sepolia Testnet / Localhost

**Wallet**
- MetaMask

**PDF Generation**
- jsPDF

---

## 🧠 System Architecture

WarrantyChain follows a decentralized Web3 architecture:

User → Frontend (React + Ethers.js) → MetaMask → Smart Contract → Blockchain

• Smart contract stores warranty and ownership data immutably  
• Frontend interacts using Ethers.js  
• MetaMask handles authentication and transaction signing  
• QR verification allows public validation without wallet  

This ensures transparency, security, and tamper-proof record keeping.

## ⚙️ How It Works

1. Register Product → Stored on blockchain  
2. Verify Warranty → Fetch data from blockchain  
3. Verify Ownership → Shows current owner & history  
4. Transfer Ownership → Securely updates ownership  
5. QR Scan → Opens public verification page  
6. Download Certificate → Generates official PDF  

All transactions are recorded immutably on blockchain.

---

## 🖥️ Local Setup

### 1️⃣ Clone Repository
git clone https://github.com/K-Deepak1610/WarrantyChain.git
cd WarrantyChain

---

### 2️⃣ Install Dependencies
npm install

If frontend is separate:
cd frontend
npm install

---

### 4️⃣ Deploy Smart Contract
npx hardhat run scripts/deploy.js --network localhost

---

### 5️⃣ Start Frontend
npm run dev

---

## 📱 QR Verification

Each product generates a QR code containing a verification link.

Scanning the QR:
- Opens verification page
- Fetches blockchain data
- Displays ownership & warranty status
- Allows PDF certificate download

---

## 🎥 Demo Video

Watch the full project demonstration here:

👉 [Project Demo Video](PASTE_YOUR_VIDEO_LINK_HERE)

(You can upload your video to YouTube as unlisted and paste the link above.)

---

## 🔐 Smart Contract Highlights

- Prevents duplicate product IDs
- Only current owner can transfer ownership
- Maintains complete ownership history
- Calculates warranty validity dynamically
- Emits blockchain events for every transaction

---

## 🌟 Future Improvements

- Deploy on mainnet
- Add IPFS document storage
- Add NFT-based ownership model
- Add multi-product dashboard analytics
- Mobile responsive PWA version

---

## 👨‍💻 Author

Deepak  
GitHub: https://github.com/K-Deepak1610

---

## 📜 License

This project is for educational and demonstration purposes.
