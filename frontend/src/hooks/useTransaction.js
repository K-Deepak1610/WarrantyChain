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
            
            const message = err.reason || err.data?.message || err.message || "Transaction failed";
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
