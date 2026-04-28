const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // 1. Deploy the contract first
    const Warranty = await hre.ethers.getContractFactory("Warranty");
    console.log("Deploying Warranty contract...");
    const warranty = await Warranty.deploy();
    await warranty.waitForDeployment();
    const address = await warranty.getAddress();
    console.log("Warranty contract deployed to:", address);

    // 2. Save artifacts to frontend
    const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }
    const artifact = artifacts.readArtifactSync("Warranty");
    fs.writeFileSync(
        path.join(contractsDir, "contract-address.json"),
        JSON.stringify({ Warranty: address }, undefined, 2)
    );
    fs.writeFileSync(
        path.join(contractsDir, "Warranty.json"),
        JSON.stringify(artifact, undefined, 2)
    );
    console.log("Artifacts and address saved to frontend/src/contracts");

    // 3. Register test products
    const products = [
        { 
            id: "SL-882", 
            name: "Cloud Architect Suite - Enterprise", 
            ownerName: "Deepak", 
            ownerContact: "9876543210",
            ownerEmail: "deepak@dev.io",
            specifications: "Version: 2026.4, License: Perpetual, Nodes: 50, Support: 24/7 Priority"
        },
        { 
            id: "NFT-991", 
            name: "CyberPunk Genesis #001", 
            ownerName: "Alice Crypto", 
            ownerContact: "1234567890",
            ownerEmail: "alice@web3.com",
            specifications: "Artist: DigitalNoir, Rarity: Mythic, Mint: #1, Blockchain: WarrantyChain-L2"
        }
    ];

    const now = Math.floor(Date.now() / 1000);
    const oneYear = 365 * 24 * 60 * 60;

    for (const p of products) {
        console.log(`Registering test product: ${p.id}...`);
        const tx = await warranty.registerProduct(
            p.id,
            p.name,
            now,
            now + oneYear,
            p.ownerName,
            p.ownerContact,
            p.ownerEmail,
            "SER-SN-" + p.id,
            p.specifications
        );
        await tx.wait();
    }

    console.log("Test products registered successfully.");
    console.log("Deployment and seeding complete.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
