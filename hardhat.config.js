require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    defaultNetwork: "localhost",
    networks: {
        hardhat: {
            chainId: 31337
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        },
        ganache: {
            url: "http://127.0.0.1:7545",
            chainId: 1337,
            ...(process.env.PRIVATE_KEY ? { accounts: [process.env.PRIVATE_KEY] } : {})
        }
    },
    paths: {
        artifacts: "./frontend/src/artifacts"
    }
};
