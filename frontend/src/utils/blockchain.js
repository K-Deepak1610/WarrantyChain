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
            productDetails.ownerEmail,
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
            ownerEmail: result[8],
            serialNumber: result[9],
            specifications: result[10],
            isExtended: result[11]
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
            ownerEmail: record[3],
            transferDate: Number(record[4])
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

export const transferOwnership = async (contract, productId, newOwner, newOwnerName, newOwnerContact, newOwnerEmail) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.transferOwnership(
            productId,
            newOwner,
            newOwnerName,
            newOwnerContact,
            newOwnerEmail
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
            warrantyEnd: Number(p.warrantyEnd),
            ownerEmail: p.ownerEmail,
            isExtended: p.isExtended
        }));
    } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
    }
};

export const addServiceRecord = async (contract, productId, description, technician, location, isPaid) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.addServiceRecord(productId, description, technician, location, isPaid);
        return tx;
    } catch (error) {
        console.error("Error adding service record:", error);
        throw error;
    }
};

export const extendWarranty = async (contract, productId, newExpiryDate) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.extendWarranty(productId, BigInt(newExpiryDate));
        return tx;
    } catch (error) {
        console.error("Error extending warranty:", error);
        throw error;
    }
};

export const getServiceHistory = async (contract, productId) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const rawHistory = await contract.getServiceHistory(productId);
        
        return rawHistory.map(record => ({
            description: record[0],
            technicianName: record[1],
            serviceDate: Number(record[2]),
            location: record[3],
            isPaid: record[4]
        }));
    } catch (error) {
        console.error("Error fetching service history:", error);
        throw error;
    }
};

export const updateProduct = async (contract, productDetails) => {
    try {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.updateProduct(
            productDetails.id,
            productDetails.ownerName,
            productDetails.ownerContact,
            productDetails.ownerEmail
        );
        return tx;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};
