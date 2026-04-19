const { ethers } = require("hardhat");

async function main() {
    const address = "0xcE77c09901b45d17860F5976bC4EB0C5ebC0d6D4";
    const balance = await ethers.provider.getBalance(address);
    console.log("Balance:", ethers.formatEther(balance), "MATIC");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
