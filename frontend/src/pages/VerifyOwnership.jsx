import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import QRScanner from '../components/QRScanner';
import QRModal from '../components/QRModal';
import HashDisplay from '../components/HashDisplay';
import { verifyOwnership, verifyWarranty, shortenAddress } from '../utils/blockchain';
import { generateCertificate } from '../utils/generateCertificate';
import { useWallet } from '../context/WalletContext';
import ContractAddress from '../contracts/contract-address.json';
import WarrantyArtifact from '../contracts/Warranty.json';
import { Search, History, QrCode, Download, ShieldCheck, User, Loader2, AlertCircle, RefreshCcw, XCircle, Clock, Cpu, Activity, Copy, CheckCircle2 } from 'lucide-react';
import { useProductLookup } from '../hooks/useProductLookup';
import { usePageTitle } from '../hooks/usePageTitle';
import { getVerifyPageURL, CONFIG } from '../config';

const VerifyOwnership = () => {
    usePageTitle('Verify Ownership');
    const { contract, contractError } = useWallet();
    const [productId, setProductId] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [showQRModal, setShowQRModal] = useState(false);
    
    const { productName: quickName, isSearching, error: lookupError } = useProductLookup(contract, productId);
    const [step, setStep] = useState('IDLE');
    const [hashDecoded, setHashDecoded] = useState("");

    const getReadOnlyContract = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                return new ethers.Contract(ContractAddress.Warranty, WarrantyArtifact.abi, provider);
            } else {
                const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
                return new ethers.Contract(ContractAddress.Warranty, WarrantyArtifact.abi, provider);
            }
        } catch (e) {
            console.warn("Read-only provider failed", e);
        }
        return null;
    };

    useEffect(() => {
        if (step === 'TRACING') {
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

    const executeVerify = async (targetId) => {
        if (!targetId) return;
        setStep('TRACING');
        setError("");
        setResult(null);

        await new Promise(r => setTimeout(r, 1500)); 

        try {
            let activeContract = contract;
            if (!activeContract) {
                activeContract = await getReadOnlyContract();
            }

            if (!activeContract) {
                throw new Error("Cannot connect to blockchain. Please connect wallet.");
            }

            const [ownershipData, warrantyData] = await Promise.all([
                verifyOwnership(activeContract, targetId),
                verifyWarranty(activeContract, targetId).catch(e => ({}))
            ]);

            setResult({
                ...ownershipData,
                ...warrantyData,
                productId: targetId,
                productName: warrantyData?.productName || ownershipData?.productName || "Unknown Product",
            });
        } catch (err) {
            console.warn("Blockchain read failed: ", err);
            setError("Product not found on the blockchain.");
        } finally {
            setStep('RESULT');
        }
    };

    const handleVerifySubmit = (e) => {
        if (e) e.preventDefault();
        executeVerify(productId);
    };

    const handleScanComplete = (data) => {
        if (data) {
            setProductId(data);
            setStep('IDLE');
            executeVerify(data);
        }
    };

    const getAgeLabel = () => {
        if (!result) return "";
        const now = Math.floor(Date.now() / 1000);
        
        // Always prioritize warrantyStart as the product's official "birth" date
        const birthDate = Number(result.warrantyStart) > 0 
            ? Number(result.warrantyStart) 
            : (result.history && result.history[0]?.transferDate) || now;

        const ageSeconds = now - birthDate;
        const days = Math.floor(ageSeconds / 86400);

        if (days <= 7) return "Brand New";
        if (days <= 30) return `${days} Days`;
        
        const years = Math.floor(days / 365);
        const months = Math.floor((days % 365) / 30);
        
        if (years > 0) {
            if (months > 0) return `${years}y ${months}m`;
            return `${years} Year${years > 1 ? 's' : ''}`;
        }
        return `${months} Month${months > 1 ? 's' : ''}`;
    };

    const getFirstHeldYear = () => {
        if (!result || !result.history || result.history.length === 0) return "";
        const firstDate = result.history[0].transferDate;
        return new Date(firstDate * 1000).getFullYear();
    };

    const getHeldDuration = (start, end) => {
        const diff = end - start;
        const days = Math.floor(diff / 86400);
        if (days <= 0) return null; 
        if (days < 30) return `Held for ${days} days`;
        const months = Math.floor(days / 30);
        if (months < 12) return `Held for ${months} months`;
        const years = Math.floor(months / 12);
        const remMonths = months % 12;
        return `Held for ${years}y ${remMonths}m`;
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-2xl mx-auto relative min-h-[80vh] flex flex-col justify-center">
            <div className="mb-6">
                <BackToDashboardButton />
            </div>

            {step === 'SCANNING' && (
                <QRScanner onScan={handleScanComplete} onClose={() => setStep('IDLE')} />
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
                            <div className="text-center pt-4 mb-8">
                                <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent tracking-tight mb-1 uppercase">
                                    Ownership History
                                </h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                                    Product Provenance Check
                                </p>
                            </div>

                            <form onSubmit={handleVerifySubmit} className="flex-1 flex flex-col justify-center gap-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-indigo-400/20 rounded-xl blur-xl transition-all group-focus-within:opacity-100 opacity-0" />
                                    <input
                                        value={productId}
                                        onChange={(e) => setProductId(e.target.value)}
                                        placeholder="Enter Product ID or Hash"
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-5 pl-5 pr-14 text-white text-lg font-mono focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all relative z-10 shadow-inner shadow-black/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setStep('SCANNING')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-300 p-2 z-20 hover:scale-110 hover:rotate-3 transition-transform"
                                    >
                                        <QrCode size={24} />
                                    </button>
                                </div>
                                
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
                                    text="Search"
                                    onClick={handleVerifySubmit}
                                    icon={Search}
                                    className="w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-500"
                                />
                            </form>
                        </motion.div>
                    )}

                    {/* TRACING STATE */}
                    {step === 'TRACING' && (
                        <motion.div
                            key="tracing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex-1 flex flex-col items-center justify-center py-12"
                        >
                            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                                <div className="absolute inset-0 border-t-2 border-b-2 border-indigo-400 rounded-full animate-[spin_2s_linear_infinite] opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                <div className="absolute inset-2 border-l-2 border-r-2 border-purple-400 rounded-full animate-[spin_1.5s_linear_infinite_reverse] opacity-70"></div>
                                <ShieldCheck size={40} className="text-indigo-400 animate-pulse drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 tracking-widest uppercase">Verifying Ownership</h3>
                            <div className="bg-slate-950 border border-indigo-500/30 px-6 py-3 rounded-xl font-mono text-indigo-400 tracking-widest shadow-inner shadow-indigo-900/50 min-w-[300px] text-center">
                                {hashDecoded}
                            </div>
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
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 tracking-[0.15em] uppercase">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                            Product Found
                                        </div>
                                        <div className="text-[10px] font-black text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5 tracking-widest uppercase">
                                            ID Verified
                                        </div>
                                    </div>

                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-indigo-900/10 border border-indigo-500/20 rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden group shadow-[0_0_50px_rgba(99,102,241,0.05)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                                        <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 relative">
                                            <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/20 animate-pulse" />
                                            <ShieldCheck size={32} className="text-indigo-400 relative z-10" />
                                        </div>
                                        <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Official Ownership Proof</h4>
                                        <h3 className="text-3xl font-black text-white tracking-tight mb-3 uppercase leading-tight">{result.ownerName}</h3>
                                        <p className="text-slate-400 text-sm font-medium mb-8 max-w-md mx-auto leading-relaxed">Current verified owner of this product on the blockchain.</p>
                                        <div className="flex gap-4">
                                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                                <User size={12} className="text-indigo-400" />
                                                {result.history.length} Owner{result.history.length !== 1 ? 's' : ''}
                                            </div>
                                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                                <History size={12} className="text-purple-400" />
                                                Held since {getFirstHeldYear()}
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-6 relative overflow-hidden">
                                            <div className="absolute top-4 right-4 text-slate-800 opacity-20"><Clock size={40} /></div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Product Age</p>
                                            <h4 className="text-2xl font-black text-white mb-2">{getAgeLabel()}</h4>
                                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Verified Record</p>
                                            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 w-full" />
                                        </div>

                                        <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-6">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Ownership Status</p>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-semibold tracking-wide">Owner Count</span>
                                                    <span className="text-indigo-400 font-black px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">{result.history.length} Owner(s)</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-semibold tracking-wide">Status</span>
                                                    <span className="text-emerald-400 font-black uppercase tracking-[0.1em] flex items-center gap-1.5"><CheckCircle2 size={12}/> Verified</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-semibold tracking-wide">Blockchain</span>
                                                    <span className="text-purple-400 font-black uppercase tracking-[0.1em]">Secured</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-8 space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Cpu size={16} className="text-purple-400" />
                                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Product Info</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Product Name</p>
                                                <p className="text-xl font-bold text-white tracking-tight">{result.productName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Product ID</p>
                                                <p className="text-base font-mono text-indigo-400 font-bold tracking-wider">{productId}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-6 border-t border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Owner Wallet Address</p>
                                            <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-4 group hover:border-indigo-500/30 transition-colors">
                                                <span className="text-indigo-300 font-mono text-sm break-all font-semibold">{result.owner}</span>
                                                <button onClick={() => navigator.clipboard.writeText(result.owner)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors">
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-8 space-y-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <History size={16} className="text-indigo-400" />
                                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Owner History</h3>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Verified Log</span>
                                        </div>

                                        <div className="space-y-0 relative pl-10">
                                            <div className="absolute left-[11px] top-6 bottom-6 w-px bg-slate-800" />
                                            {result.history.map((record, index) => {
                                                const total = result.history.length;
                                                const stepNum = (index + 1).toString().padStart(2, '0');
                                                const isOrigin = index === 0;
                                                const isCurrent = index === total - 1;
                                                
                                                // Dynamic Labels matching the image
                                                let label = "PREVIOUS OWNER";
                                                let color = "indigo";
                                                if (isOrigin) {
                                                    label = "PREVIOUS OWNER";
                                                    color = "cyan";
                                                }
                                                
                                                if (isCurrent) {
                                                    label = "CURRENT OWNER";
                                                    color = "emerald";
                                                }

                                                // Color Mappings
                                                const colorMap = {
                                                    cyan: "border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
                                                    indigo: "border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]",
                                                    emerald: "border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                };

                                                const labelColorMap = {
                                                    cyan: "text-cyan-400",
                                                    indigo: "text-indigo-400",
                                                    emerald: "text-emerald-400"
                                                };

                                                // Calculate "Held for"
                                                const nextRecord = result.history[index + 1];
                                                const heldDuration = nextRecord 
                                                    ? getHeldDuration(record.transferDate, nextRecord.transferDate)
                                                    : getHeldDuration(record.transferDate, Math.floor(Date.now() / 1000));

                                                return (
                                                    <div key={index} className="relative pb-12 last:pb-0">
                                                        {/* Numbered Stamp */}
                                                        <div className={`absolute -left-[45px] top-2 w-[34px] h-[34px] rounded-full border-2 bg-slate-950 flex items-center justify-center text-[10px] font-black z-10 transition-all ${colorMap[color]}`}>
                                                            {stepNum}
                                                        </div>
                                                        
                                                        {/* Content Area */}
                                                        <div className={`transition-all duration-500 ${isCurrent || isOrigin ? 'bg-white/5 p-6 rounded-[1.5rem] border border-white/5 shadow-inner' : 'pl-4'}`}>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-[0.2em] ${color === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'}`}>
                                                                        {label}
                                                                    </span>
                                                                    {isCurrent && (
                                                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-black tracking-widest flex items-center gap-1">
                                                                            <CheckCircle2 size={8} /> YOU
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <h4 className={`font-bold tracking-tight text-white ${isCurrent ? 'text-xl' : 'text-lg'}`}>
                                                                    {record.ownerName}
                                                                </h4>

                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-slate-500 font-mono tracking-tight lowercase opacity-70">
                                                                        {record.owner}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                                        {new Date((isOrigin && Number(result.warrantyStart) > 0 ? Number(result.warrantyStart) : record.transferDate) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — {isOrigin ? 'Product Registered' : 'Ownership transferred'}
                                                                    </p>
                                                                </div>

                                                                {heldDuration && (
                                                                    <div className="pt-2">
                                                                        <span className="px-3 py-1 rounded-full bg-slate-800/80 text-[9px] font-bold text-slate-400 border border-white/5">
                                                                            {heldDuration}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                                        <button onClick={() => setStep('IDLE')} className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest">
                                            <Search size={14} /> New Scan
                                        </button>
                                        <button onClick={() => setShowQRModal(true)} className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-500/5 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-all text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                                            <QrCode size={14} /> Generate QR
                                        </button>
                                        <button onClick={() => generateCertificate({...result, productId, contractAddress: ContractAddress.Warranty})} className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-500/5 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-all text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                                            <Download size={14} /> Export PDF
                                        </button>
                                    </div>

                                    <QRModal 
                                        isOpen={showQRModal}
                                        onClose={() => setShowQRModal(false)}
                                        value={`${getVerifyPageURL()}?id=${encodeURIComponent(productId)}`}
                                        metadata={{ productName: result.productName, productId: productId }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
};

export default VerifyOwnership;
