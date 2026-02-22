import { ethers } from 'ethers';

// Helper to shorten address
export const shortenAddress = (address) => {
    return `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;
};

// Pure functions that take the contract instance as an argument.
// The contract instance is provided by WalletContext.

export const registerProduct = async (contract, productDetails) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.registerProduct(
            productDetails.id,
            productDetails.name,
            BigInt(productDetails.warrantyStart),
            BigInt(productDetails.warrantyEnd),
            productDetails.ownerName,
            productDetails.ownerContact
        );
        await tx.wait();
        return tx;
    } catch (error) {
        console.error("Error registering product:", error);
        throw error;
    }
};

export const verifyWarranty = async (contract, productId) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const result = await contract.verifyWarranty(productId);

        // Destructure and format
        return {
            productName: result[0],
            warrantyStart: Number(result[1]),
            warrantyEnd: Number(result[2]),
            isValid: result[3],
            daysRemaining: Number(result[4]),
            ownerAddress: result[5],
            ownerName: result[6],
            ownerContact: result[7]
        };
    } catch (error) {
        console.error("Error verifying warranty:", error);
        throw error;
    }
};

export const verifyOwnership = async (contract, productId) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const result = await contract.verifyOwnership(productId);

        // Result[3] is now an array of structs (tuples)
        // We need to map them to JS objects
        const history = result[3].map(record => ({
            ownerAddress: record[0],
            ownerName: record[1],
            ownerContact: record[2],
            transferDate: Number(record[3])
        }));

        return {
            ownerAddress: result[0],
            ownerName: result[1],
            ownerContact: result[2],
            history: history
        };
    } catch (error) {
        console.error("Error verifying ownership:", error);
        throw error;
    }
};

export const transferOwnership = async (contract, productId, newOwner, newOwnerName, newOwnerContact) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.transferOwnership(
            productId,
            newOwner,
            newOwnerName,
            newOwnerContact
        );
        await tx.wait();
        return tx;
    } catch (error) {
        console.error("Error transferring ownership:", error);
        throw error;
    }
};
