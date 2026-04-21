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
            productDetails.serialNumber
        );
        // We no longer await tx.wait() here. 
        // The UI will handle the mining state.
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
            ownerName: result[6]
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

        // Result[2] is now an array of structs (tuples)
        // We need to map them to JS objects
        const history = result[2].map(record => ({
            ownerAddress: record[0],
            ownerName: record[1],
            transferDate: Number(record[2])
        }));

        return {
            ownerAddress: result[0],
            ownerName: result[1],
            history: history
        };
    } catch (error) {
        console.error("Error verifying ownership:", error);
        throw error;
    }
};

export const transferOwnership = async (contract, productId, newOwner, newOwnerName) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.transferOwnership(
            productId,
            newOwner,
            newOwnerName
        );
        // We no longer await tx.wait() here.
        // The UI will handle the mining state.
        return tx;
    } catch (error) {
        console.error("Error transferring ownership:", error);
        throw error;
    }
};

export const getAllProducts = async (contract) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const rawProducts = await contract.getAllProducts();
        
        return rawProducts.map(p => ({
            id: p.productId,
            name: p.productName,
            ownerName: p.ownerName,
            ownerAddress: p.ownerAddress,
            warrantyStart: Number(p.warrantyStart),
            warrantyEnd: Number(p.warrantyEnd)
        }));
    } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
    }
};
