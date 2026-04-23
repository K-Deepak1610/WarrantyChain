import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import QRScanner from '../components/QRScanner';
import QRCodeDisplay from '../components/QRCodeDisplay';
import QRModal from '../components/QRModal';
import DownloadCertificate from '../components/DownloadCertificate';
import HashDisplay from '../components/HashDisplay';
import { verifyWarranty, shortenAddress } from '../utils/blockchain';
import { generateCertificate } from '../utils/generateCertificate';
import { useWallet } from '../context/WalletContext';
import ContractAddress from '../contracts/contract-address.json';
import WarrantyArtifact from '../contracts/Warranty.json';
import { Search, CheckCircle, XCircle, QrCode, User, Calendar, Clock, Download, Settings, RefreshCcw, Cpu, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useProductLookup } from '../hooks/useProductLookup';
import { usePageTitle } from '../hooks/usePageTitle';
import { getBaseURL, getVerifyPageURL } from '../config';

const VerifyWarranty = () => {
    usePageTitle('Verify Warranty');
    const { contract, contractError } = useWallet();
    const [productId, setProductId] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [showQRModal, setShowQRModal] = useState(false);
    
    // Instant Lookup Hook
    const { productName: quickName, isSearching, error: lookupError } = useProductLookup(contract, productId);
    
    // State Machine: 'IDLE' | 'SCANNING' | 'VALIDATING' | 'RESULT'
    const [step, setStep] = useState('IDLE');
    const [hashDecoded, setHashDecoded] = useState("");

    // Read-only fallback
    const getReadOnlyContract = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                return new ethers.Contract(ContractAddress.Warranty, WarrantyArtifact.abi, provider);
            } else {
                // Public RPC fallback for users without MetaMask
                const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
                return new ethers.Contract(ContractAddress.Warranty, WarrantyArtifact.abi, provider);
            }
        } catch (e) {
            console.warn("Read-only provider failed", e);
        }
        return null;
    };

    // Hash Decrypt Animation
    useEffect(() => {
        if (step === 'VALIDATING') {
            let iterations = 0;
            const target = productId || "0xPROCESSING_DATA";
            const interval = setInterval(() => {
                setHashDecoded(target.split("").map((char, index) => {
                    if (index < iterations) return char;
                    return String.fromCharCode(33 + Math.floor(Math.random() * 94));
                }).join(""));
                if (iterations >= target.length) clearInterval(interval);
                iterations += 1/2;
            }, 30);
            return () => clearInterval(interval);
        }
    }, [step, productId]);

    // Main Executor
    const executeVerification = async (targetId) => {
        if (!targetId) return;
        setStep('VALIDATING');
        setError("");
        setResult(null);

        // Artificial delay for animation
        await new Promise(r => setTimeout(r, 1500)); 

        try {
            let activeContract = contract;
            if (!activeContract) {
                activeContract = await getReadOnlyContract();
            }

            if (!activeContract) {
                throw new Error("Cannot connect to blockchain. Please connect wallet.");
            }

            const data = await verifyWarranty(activeContract, targetId);
            setResult(data);
        } catch (err) {
            console.warn("Blockchain read failed.", err);
            setError("Product not found on the blockchain.");
        } finally {
            setStep('RESULT');
        }
    };

    const handleVerifySubmit = (e) => {
        if (e) e.preventDefault();
        executeVerification(productId);
    };

    const handleScanComplete = (data) => {
        if (data) {
            setProductId(data);
            setStep('IDLE'); // Transition from bottom sheet back to main frame
            executeVerification(data);
        }
    };

    const StatusBadge = ({ isValid, days }) => (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 relative overflow-hidden
            ${isValid
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                    : 'bg-red-500/10 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}
        >
            {/* Glowing orb behind icon */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none 
                ${isValid ? 'bg-emerald-500' : 'bg-red-500'}`} 
            />
            {isValid ? null : <XCircle size={64} className="text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] relative z-10" />}
            <h3 className={`text-3xl font-black tracking-tight relative z-10 ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                {isValid ? "WARRANTY ACTIVE" : "WARRANTY EXPIRED"}
            </h3>
            <p className={`text-xl mt-2 font-mono relative z-10 ${isValid ? 'text-emerald-200' : 'text-red-300'}`}>
                {isValid ? `${days} Days Remaining` : "Warranty Period Over"}
            </p>
        </motion.div>
    );

    return (
        <div className="pt-24 pb-12 px-6 max-w-2xl mx-auto relative min-h-[80vh] flex flex-col justify-center">
            <div className="mb-6">
                <BackToDashboardButton />
            </div>

            {step === 'SCANNING' && (
                <QRScanner onScan={handleScanComplete} onClose={() => setStep('IDLE')} />
            )}

            {contractError && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-sm flex items-center justify-center gap-2">
                    <AlertCircle size={16} />
                    {contractError}
                </div>
            )}
            
            <GlassCard className="relative overflow-hidden min-h-[400px] flex flex-col">
                <AnimatePresence mode="wait">
                    
                    {/* IDLE STATE */}
                    {step === 'IDLE' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            className="flex flex-col h-full flex-1"
                        >
                            <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-8 text-center pt-4 tracking-tight">
                                Verify Product Warranty
                            </h2>

                            <form onSubmit={handleVerifySubmit} className="flex-1 flex flex-col justify-center gap-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-cyan-400/20 rounded-xl blur-xl transition-all group-focus-within:opacity-100 opacity-0" />
                                    <input
                                        value={productId}
                                        onChange={(e) => setProductId(e.target.value)}
                                        placeholder="Enter Product ID or Hash"
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-5 pl-5 pr-14 text-white text-lg font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all relative z-10 shadow-inner shadow-black/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setStep('SCANNING')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-300 p-2 z-20 hover:scale-110 hover:rotate-3 transition-transform"
                                    >
                                        <QrCode size={24} />
                                    </button>
                                </div>
                                
                                {/* Instant Lookup Status */}
                                <AnimatePresence>
                                    {(isSearching || quickName || (lookupError && productId.length > 3)) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={`px-4 py-2 rounded-xl flex items-center gap-3 border transition-all ${
                                                isSearching ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' :
                                                quickName ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                'bg-red-500/10 border-red-500/20 text-red-400'
                                            }`}
                                        >
                                            {isSearching ? <Loader2 size={14} className="animate-spin" /> : 
                                             quickName ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                                            <span className="text-xs font-bold tracking-wider uppercase">
                                                {isSearching ? "Searching Ledger..." : 
                                                 quickName ? `FOUND: ${quickName}` : "Product not found"}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatedButton
                                    text="Verify Now"
                                    onClick={handleVerifySubmit}
                                    icon={Search}
                                    className="w-full py-4 text-lg bg-slate-900"
                                />
                            </form>
                        </motion.div>
                    )}

                    {/* VALIDATING STATE */}
                    {step === 'VALIDATING' && (
                        <motion.div
                            key="validating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex-1 flex flex-col items-center justify-center py-12"
                        >
                            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                                {/* Outer rotating ring */}
                                <div className="absolute inset-0 border-t-2 border-b-2 border-cyan-400 rounded-full animate-[spin_2s_linear_infinite] opacity-50 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                                {/* Inner opposite rotating ring */}
                                <div className="absolute inset-2 border-l-2 border-r-2 border-indigo-400 rounded-full animate-[spin_1.5s_linear_infinite_reverse] opacity-70"></div>
                                <Cpu size={40} className="text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-4 tracking-widest uppercase">Checking Blockchain</h3>
                            
                            <div className="bg-slate-950 border border-cyan-500/30 px-6 py-3 rounded-xl font-mono text-cyan-400 tracking-widest shadow-inner shadow-cyan-900/50 min-w-[300px] text-center">
                                {hashDecoded}
                            </div>
                            <p className="text-slate-500 text-sm mt-6 animate-pulse">Fetching details from the ledger...</p>
                        </motion.div>
                    )}

                    {/* RESULT STATE */}
                    {step === 'RESULT' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 space-y-6 pt-2"
                        >
                            {error ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <XCircle size={64} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Record Not Found</h3>
                                    <p className="text-slate-400 mb-8 max-w-xs">{error}</p>
                                    <AnimatedButton text="Search Again" onClick={() => setStep('IDLE')} icon={RefreshCcw} />
                                </div>
                            ) : result && (
                                <div className="space-y-6">
                                    <StatusBadge isValid={result.isValid} days={result.daysRemaining} />

                                    {/* New Authenticity Card */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-5 flex items-center gap-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                    >
                                        <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/40">
                                            <ShieldCheck size={28} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-1">Ownership Verified</h4>
                                            <p className="text-blue-100 text-sm leading-relaxed">
                                                This product is registered on <strong>WarrantyChain</strong> and <strong>{result.ownerName}</strong> is the current owner.
                                            </p>
                                        </div>
                                    </motion.div>

                                    <div className="bg-slate-950/40 rounded-3xl p-6 border border-white/5 space-y-4 backdrop-blur-md relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <ShieldCheck size={100} />
                                        </div>
                                        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Cpu size={20} className="text-cyan-400" />
                                                Registry Details
                                            </h3>
                                            <div className="flex items-center gap-1 text-[10px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-md uppercase tracking-tighter">
                                                <Settings size={10} className="animate-[spin_4s_linear_infinite]" />
                                                Blockchain Verified
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                            <div>
                                                <p className="text-slate-500 text-[10px] font-black mb-1 tracking-widest uppercase">Product Name</p>
                                                <p className="text-white font-bold text-xl drop-shadow-sm">{result.productName}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-[10px] font-black mb-1 tracking-widest uppercase">Product ID</p>
                                                <p className="text-cyan-400 font-mono text-sm break-all bg-black/30 p-2 rounded-lg border border-white/5">{productId}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><Calendar className="text-emerald-400" size={18} /></div>
                                                <div>
                                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Warranty Register</p>
                                                    <p className="text-slate-100 text-sm font-mono">{new Date(result.warrantyStart * 1000).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20"><Clock className="text-red-400" size={18} /></div>
                                                <div>
                                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Warranty Expiry</p>
                                                    <p className="text-slate-100 text-sm font-mono">{new Date(result.warrantyEnd * 1000).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl p-6 border border-indigo-500/20 space-y-4">
                                        <h3 className="text-lg font-bold text-indigo-300 border-b border-indigo-500/20 pb-2 flex items-center gap-2">
                                            <User size={18} /> Owner Node
                                        </h3>
                                        <div className="space-y-3 font-mono text-sm">
                                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                                <span className="text-slate-400">Owner Name</span>
                                                <span className="text-white font-medium">{result.ownerName}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                                <span className="text-slate-400">Owner Contact</span>
                                                <span className="text-white font-medium">{result.ownerContact || "Not Provided"}</span>
                                            </div>
                                            <div className="pt-2 mx-4">
                                                <HashDisplay 
                                                    label="Owner Wallet Address" 
                                                    value={shortenAddress(result.owner)} 
                                                    isBackup={false}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <QRModal 
                                        isOpen={showQRModal}
                                        onClose={() => setShowQRModal(false)}
                                        value={`${getVerifyPageURL()}?name=${encodeURIComponent(result.productName)}&id=${encodeURIComponent(productId)}&owner=${encodeURIComponent(result.ownerName)}&status=${result.isValid ? 'Active' : 'Expired'}&valid=${encodeURIComponent(new Date(result.warrantyEnd * 1000).toLocaleDateString())}`}
                                        metadata={{ productName: result.productName, productId: productId }}
                                    />

                                    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setStep('IDLE')}
                                            className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 text-sm font-bold"
                                        >
                                            <Search size={18} />
                                            New Scan
                                        </button>
                                        
                                        <button
                                            onClick={() => setShowQRModal(true)}
                                            className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all active:scale-95 text-sm font-black tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                                        >
                                            <QrCode size={18} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                            Generate QR
                                        </button>

                                        <button
                                            onClick={() => generateCertificate({
                                                ...result,
                                                productId,
                                                contractAddress: ContractAddress.Warranty
                                            })}
                                            className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all active:scale-95 text-sm font-black tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                                        >
                                            <Download size={18} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                            Export PDF
                                        </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
};

export default VerifyWarranty;
