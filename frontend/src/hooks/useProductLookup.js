import { useState, useEffect } from 'react';
import { verifyWarranty } from '../utils/blockchain';

/**
 * Custom hook to fetch a product name instantly while typing.
 * Includes a 400ms debounce to avoid spamming the blockchain.
 * 
 * @param {Object} contract - Ethers contract instance
 * @param {string} productId - The ID to look up
 */
export const useProductLookup = (contract, productId) => {
    const [productData, setProductData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Clear state if input is too short or empty
        if (!productId || productId.trim().length < 2) {
            setProductData(null);
            setIsSearching(false);
            setError("");
            return;
        }

        const timer = setTimeout(async () => {
            if (!contract) return;

            setIsSearching(true);
            setError("");
            
            try {
                const cleanId = productId.trim();
                const data = await verifyWarranty(contract, cleanId);
                
                if (data && data.productName && data.productName !== "") {
                    setProductData(data);
                    setError("");
                } else {
                    setProductData(null);
                    setError("Product ID not found");
                }
            } catch (err) {
                // If the contract reverts, it usually means ID doesn't exist
                setProductData(null);
                setError("Product ID not found");
            } finally {
                setIsSearching(false);
            }
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [productId, contract]);

    return { productData, isSearching, error };
};
