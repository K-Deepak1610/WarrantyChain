import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import WarrantyArtifact from '../contracts/Warranty.json';
import ContractAddress from '../contracts/contract-address.json';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

let globalBrowserProvider = null;

const getBrowserProvider = (ethProvider) => {
    if (!globalBrowserProvider) {
        globalBrowserProvider = new ethers.BrowserProvider(ethProvider, "any");
        globalBrowserProvider.pollingInterval = 15000; // Throttle block polling to 15s to prevent RPC -32002 errors
    }
    return globalBrowserProvider;
};

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [contractError, setContractError] = useState("");

    const switchToGanache = async (ethProvider) => {
        const GANACHE_CHAIN_ID = '0x539'; // 1337
        try {
            await ethProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: GANACHE_CHAIN_ID }],
            });
            return true;
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await ethProvider.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                             chainId: GANACHE_CHAIN_ID,
                             chainName: 'Ganache Local',
                             nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                             rpcUrls: ['http://127.0.0.1:7545']
                        }],
                    });
                    return true;
                } catch (addError) {
                    console.error("Error adding Ganache network:", addError);
                    return false;
                }
            }
            console.error("Error switching network:", switchError);
            return false;
        }
    };

    // Initialize provider and contract on mount via MetaMask (read-only mode)
    useEffect(() => {
        const init = async () => {
            let ethProvider = window.ethereum;
            if (ethProvider?.providers) {
                ethProvider = ethProvider.providers.find(p => p.isMetaMask) || ethProvider.providers[0];
            }

            if (ethProvider) {
                const browserProvider = getBrowserProvider(ethProvider);
                setProvider(browserProvider);
                
                const readOnlyContract = new ethers.Contract(
                    ContractAddress.Warranty,
                    WarrantyArtifact.abi,
                    browserProvider
                );
                setContract(readOnlyContract);
                
                // Health Check
                const code = await browserProvider.getCode(ContractAddress.Warranty);
                if (code === "0x" || code === "0x0") {
                    setContractError("Smart contract not found on this network. Please redeploy.");
                } else {
                    setContractError("");
                }
                
                // Check if already connected
                const accounts = await ethProvider.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    await attachSigner(accounts[0], browserProvider);
                }

                // Listeners
                const handleAccountsChanged = async (newAccounts) => {
                    if (newAccounts.length > 0) {
                        setAccount(newAccounts[0]);
                        await attachSigner(newAccounts[0], browserProvider);
                    } else {
                        setAccount("");
                        setSigner(null);
                    }
                };

                const handleChainChanged = () => window.location.reload();

                ethProvider.on('accountsChanged', handleAccountsChanged);
                ethProvider.on('chainChanged', handleChainChanged);

                return () => {
                    ethProvider.removeListener('accountsChanged', handleAccountsChanged);
                    ethProvider.removeListener('chainChanged', handleChainChanged);
                };
            }
        };
        init();
    }, []);

    const attachSigner = async (currentAccount, activeProvider) => {
        try {
            const currentSigner = await activeProvider.getSigner();
            setSigner(currentSigner);
            
            const signedContract = new ethers.Contract(
                ContractAddress.Warranty,
                WarrantyArtifact.abi,
                currentSigner
            );
            setContract(signedContract);
        } catch (error) {
            console.error("Error attaching signer:", error);
        }
    };

    const connectWallet = async () => {
        let ethProvider = window.ethereum;
        if (ethProvider?.providers) {
            ethProvider = ethProvider.providers.find(p => p.isMetaMask) || ethProvider.providers[0];
        }

        if (!ethProvider) {
            alert("MetaMask not found. Please install it to use this app.");
            return;
        }

        try {
            setLoading(true);

            // Force switch to Ganache first
            const chainId = await ethProvider.request({ method: 'eth_chainId' });
            if (chainId !== '0x539') {
                const switched = await switchToGanache(ethProvider);
                if (!switched) throw new Error("Please switch to Ganache Local network.");
            }

            const accounts = await ethProvider.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            
            const browserProvider = getBrowserProvider(ethProvider);
            await attachSigner(accounts[0], browserProvider);
        } catch (error) {
            console.error("Connection error:", error);
            alert(error.message || "Failed to connect wallet.");
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = async () => {
        setAccount("");
        setSigner(null);
        let ethProvider = window.ethereum;
        if (ethProvider) {
            const browserProvider = getBrowserProvider(ethProvider);
            setProvider(browserProvider);
            const readOnlyContract = new ethers.Contract(
                ContractAddress.Warranty,
                WarrantyArtifact.abi,
                browserProvider
            );
            setContract(readOnlyContract);
        }
    };

    const contextValue = React.useMemo(() => ({
        account,
        contract,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        loading,
        isConnected: !!account,
        contractError
    }), [account, contract, provider, signer, loading, contractError]);

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};
