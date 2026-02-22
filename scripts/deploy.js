const hre = require("hardhat");

async function main() {
    const Warranty = await hre.ethers.getContractFactory("Warranty");

    console.log("Deploying Warranty contract...");
    const warranty = await Warranty.deploy();

    await warranty.waitForDeployment();

    const address = await warranty.getAddress();

    console.log("Warranty contract deployed to:", address);

    // Save the address and artifact for frontend to use
    const fs = require("fs");
    const path = require("path");

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
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
