import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import WarrantyArtifact from '../contracts/Warranty.json';
import ContractAddress from '../contracts/contract-address.json';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [loading, setLoading] = useState(false);

    // Initialize read-only provider and contract on mount
    useEffect(() => {
        const initializeReadOnly = async () => {
            try {
                // Hardhat local node default URL
                const readOnlyProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
                const readOnlyContract = new ethers.Contract(
                    ContractAddress.Warranty,
                    WarrantyArtifact.abi,
                    readOnlyProvider
                );
                setProvider(readOnlyProvider);
                setContract(readOnlyContract);
                console.log("Read-only contract initialized");
            } catch (error) {
                console.error("Error initializing read-only provider:", error);
            }
        };

        initializeReadOnly();
    }, []);

    // Event listeners for MetaMask
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    initializeEthers(accounts[0]);
                } else {
                    disconnectWallet();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    const initializeEthers = async (currentAccount) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);

            const signer = await provider.getSigner();
            setSigner(signer);

            const contract = new ethers.Contract(
                ContractAddress.Warranty,
                WarrantyArtifact.abi,
                signer
            );
            setContract(contract);
        } catch (error) {
            console.error("Error initializing ethers:", error);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask not detected");
            return;
        }

        try {
            setLoading(true);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            setAccount(account);
            initializeEthers(account);
        } catch (error) {
            console.error("Error connecting wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = async () => {
        setAccount("");
        setSigner(null);
        // Re-initialize read-only state
        try {
            const readOnlyProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const readOnlyContract = new ethers.Contract(
                ContractAddress.Warranty,
                WarrantyArtifact.abi,
                readOnlyProvider
            );
            setProvider(readOnlyProvider);
            setContract(readOnlyContract);
        } catch (error) {
            console.error("Error re-initializing read-only provider:", error);
        }
    };

    return (
        <WalletContext.Provider value={{
            account,
            contract,
            provider,
            signer,
            connectWallet,
            disconnectWallet,
            loading,
            isConnected: !!account
        }}>
            {children}
        </WalletContext.Provider>
    );
};
