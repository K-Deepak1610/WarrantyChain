import { ethers } from 'ethers';

// Helper to shorten address
export const shortenAddress = (address) => {
    if (!address) return "0x000...0000";
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
            productDetails.ownerContact,
            productDetails.serialNumber,
            productDetails.specifications
        );
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

        return {
            productName: result[0],
            warrantyStart: Number(result[1]),
            warrantyEnd: Number(result[2]),
            isValid: result[3],
            daysRemaining: Number(result[4]),
            owner: result[5],
            ownerName: result[6],
            ownerContact: result[7],
            serialNumber: result[8],
            specifications: result[9]
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

        const history = result[2].map(record => ({
            owner: record[0],
            ownerName: record[1],
            ownerContact: record[2],
            transferDate: Number(record[3])
        }));

        return {
            owner: result[0],
            ownerName: result[1],
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
            ownerContact: p.ownerContact,
            owner: p.owner,
            serialNumber: p.serialNumber,
            specifications: p.specifications,
            warrantyStart: Number(p.warrantyStart),
            warrantyEnd: Number(p.warrantyEnd)
        }));
    } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
    }
};
