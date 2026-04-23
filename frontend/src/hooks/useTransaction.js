import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the lifecycle of a blockchain transaction.
 */
export const useTransaction = () => {
    const [stage, setStage] = useState('idle'); // idle, waiting, processing, success, error
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);
    const [txHash, setTxHash] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [metadata, setMetadata] = useState(null);

    const execute = useCallback(async (txPromise, txMetadata) => {
        setStage('waiting');
        setStatus('Waiting for wallet confirmation...');
        setError(null);
        setTxHash('');
        setReceipt(null);
        setMetadata(txMetadata);

        try {
            // Step 1: Wait for user to confirm in MetaMask
            const tx = await txPromise;
            
            setStage('processing');
            setStatus('Transaction broadcasting to Ganache...');
            setTxHash(tx.hash);

            // Step 2: Wait for transaction to be mined
            const txReceipt = await tx.wait();
            
            setReceipt(txReceipt);
            setStage('success');
            setStatus('Transaction successfully mined!');
            
            return txReceipt;
        } catch (err) {
            console.error("Transaction Error:", err);
            setStage('error');
            
            // Extract the most descriptive error message possible
            let message = "Transaction failed";
            
            // Log for debugging (helps in support)
            console.log("Parsing error detail:", JSON.stringify(err, (key, value) => 
                typeof value === 'bigint' ? value.toString() : value
            ));

            if (err.reason) {
                message = err.reason;
            } else if (err.info?.error?.message) {
                message = err.info.error.message;
            } else if (err.data?.message) {
                message = err.data.message;
            } else if (err.message) {
                message = err.message;
            }

            // Drill down into "Internal JSON-RPC error" or "execution reverted"
            const drillDown = (obj) => {
                if (!obj) return null;
                if (typeof obj === 'string' && obj.includes("reverted:")) return obj;
                if (obj.message && obj.message.includes("reverted:")) return obj.message;
                if (obj.data?.message) return drillDown(obj.data.message);
                if (obj.info?.error) return drillDown(obj.info.error);
                return null;
            };

            const deeperMessage = drillDown(err);
            if (deeperMessage) message = deeperMessage;

            // Human-friendly mapping for common obscure labels
            if (message.includes("Internal JSON-RPC error")) {
                message = "Error: This Product ID or Serial Number has already been registered on the Ganache blockchain.";
            }
            if (message.includes("user rejected")) message = "Transaction cancelled by user.";
            if (message.includes("insufficient funds")) message = "Insufficient ETH for gas + value.";
            if (message.includes("execution reverted") || message.includes("CALL_EXCEPTION")) {
                if (message.toLowerCase().includes("registered")) {
                    message = "Error: This Product ID is already registered!";
                } else if (message.toLowerCase().includes("owner")) {
                    message = "Error: You are not the owner of this product!";
                } else {
                    message = "The transaction was rejected by the Smart Contract logic.";
                }
            }

            // Final cleanup
            message = message.split("(")[0].replace("execution reverted:", "").trim();

            setError(message);
            throw err;
        }
    }, []);

    const reset = () => {
        setStage('idle');
        setStatus('');
        setError(null);
        setTxHash('');
        setReceipt(null);
        setMetadata(null);
    };

    return {
        stage,
        status,
        error,
        txHash,
        receipt,
        metadata,
        execute,
        reset
    };
};
