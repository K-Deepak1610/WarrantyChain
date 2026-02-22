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

    // 3. Register a test product
    const productId = "TEST-QR-SCANNED";
    console.log(`Registering test product: ${productId}...`);

    // Using the first signer (default Hardhat account)
    const [deployer] = await hre.ethers.getSigners();

    const now = Math.floor(Date.now() / 1000);
    const oneYear = 365 * 24 * 60 * 60;

    const tx = await warranty.registerProduct(
        productId,
        "Premium Quantum Laptop",
        now,
        now + oneYear,
        "John Doe",
        "john.doe@example.com"
    );
    await tx.wait();

    console.log("Test product registered successfully.");
    console.log("Deployment and seeding complete.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
