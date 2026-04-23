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
        { id: "IP001", name: "iPhone 17 Pro Max", ownerName: "John Doe" },
        { id: "DL002", name: "Dell XPS 15 Ultra", ownerName: "Jane Smith" }
    ];

    const [deployer] = await hre.ethers.getSigners();
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
            "SER-SN-" + p.id
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
