import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import HashDisplay from '../components/HashDisplay';
import { verifyWarranty, verifyOwnership, shortenAddress } from '../utils/blockchain';
import { generateCertificate } from '../utils/generateCertificate';
import { useWallet } from '../context/WalletContext';
import ContractAddress from '../contracts/contract-address.json';
import {
    CheckCircle,
    XCircle,
    ShieldCheck,
    Calendar,
    Clock,
    User,
    Database,
    History,
    Download,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { getBaseURL, CONFIG } from '../config';
import WarrantyArtifact from '../contracts/Warranty.json';

const PublicVerify = () => {
    usePageTitle('Product Verification');
    const { productId } = useParams();
    const { contract } = useWallet();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Read-only fallback for Guest/Mobile scans
    const getReadOnlyContract = async () => {
        try {
            // Check for MetaMask/Ethereum provider first
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                return new ethers.Contract(ContractAddress.Warranty, WarrantyArtifact.abi, provider);
            } else {
                // Public RPC fallback for guests scanning via mobile
                const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
                return new ethers.Contract(ContractAddress.Warranty, WarrantyArtifact.abi, provider);
            }
        } catch (e) {
            console.warn("Read-only provider failed", e);
        }
        return null;
    };

    useEffect(() => {
        const init = async () => {
            await fetchData();
        };
        init();
    }, [contract, productId]);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            let activeContract = contract;
            if (!activeContract) {
                activeContract = await getReadOnlyContract();
            }

            if (!activeContract) {
                throw new Error("Unable to connect to blockchain node.");
            }

            const [warrantyData, ownershipData] = await Promise.all([
                verifyWarranty(activeContract, productId),
                verifyOwnership(activeContract, productId).catch(() => ({}))
            ]);

            setResult({
                ...warrantyData,
                ...ownershipData,
                productId
            });
        } catch (err) {
            console.warn("Blockchain read failed:", err);
            setError("The product with this ID could not be found on the blockchain.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20">
                <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Verifying with Blockchain...</p>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto relative">
            <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
                <ChevronLeft size={20} />
                <span>Back to Home</span>
            </Link>

            {error ? (
                <GlassCard className="text-center py-12">
                    <XCircle size={64} className="text-red-500 mx-auto mb-6 opacity-80" />
                    <h2 className="text-3xl font-bold text-white mb-4">Verification Failed</h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-8">
                        {error}
                    </p>
                    <Link to="/verify-warranty">
                        <AnimatedButton text="Search Different ID" className="mx-auto" />
                    </Link>
                </GlassCard>
            ) : result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Header Certificate Style */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-1 border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.3)] relative overflow-hidden">
                        {/* Decorative background circle */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

                        <div className="glass-card rounded-[2.3rem] p-8 md:p-12 border-none shadow-none">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/5 pb-8 mb-8">
                                <div>
                                    <h1 className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Official Verification</h1>
                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                        WARRANTYCHAIN<br />
                                        <span className="text-blue-400">CERTIFICATE</span>
                                    </h2>
                                </div>
                                <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center">
                                    <ShieldCheck size={48} className="text-blue-500 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Assets</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Database size={14} className="text-blue-500" /> Product Information
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="text-3xl font-bold text-white leading-tight">{result.productName}</p>
                                            <p className="text-slate-400 font-mono text-sm tracking-wider">ID: {result.productId}</p>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <User size={14} className="text-blue-500" /> Current Ownership
                                        </h3>
                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Legal Owner</span>
                                                <span className="text-white font-bold">{result.ownerName}</span>
                                            </div>
                                            <div className="pt-4">
                                                <HashDisplay 
                                                    label="Blockchain Address" 
                                                    value={shortenAddress(result.ownerAddress)} 
                                                    isBackup={false} 
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <History size={14} className="text-blue-500" /> Warranty Status
                                        </h3>
                                        <div className={`p-6 rounded-2xl border ${result.isValid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                            <div className="flex items-center gap-4 mb-4">
                                                {result.isValid ? <CheckCircle className="text-emerald-500" size={32} /> : <XCircle className="text-red-500" size={32} />}
                                                <span className={`text-2xl font-black ${result.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {result.isValid ? "VALID" : "EXPIRED"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</span>
                                                    <span className="text-white text-sm font-medium">{new Date(result.warrantyStart * 1000).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">End Date</span>
                                                    <span className="text-white text-sm font-medium">{new Date(result.warrantyEnd * 1000).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {result.isValid && (
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <p className="text-emerald-300/60 text-xs font-bold uppercase tracking-widest">
                                                        {result.daysRemaining} Days Guarantee Remaining
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={() => generateCertificate({
                                                ...result,
                                                contractAddress: ContractAddress.Warranty
                                            })}
                                            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <Download size={20} />
                                            Download official PDF
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline section if history exists */}
                            {result.history && result.history.length > 0 && (
                                <section className="mt-12 pt-12 border-t border-white/5">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                                        <History size={14} className="text-blue-500" /> Ownership History Highlights
                                    </h3>
                                    <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide">
                                        {result.history.map((record, i) => (
                                            <div key={i} className="min-w-[200px] bg-white/5 p-4 rounded-2xl border border-white/5 relative">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-white font-bold text-sm">{record.ownerName}</span>
                                                </div>
                                                <div className="mb-3">
                                                    <HashDisplay value={record.ownerAddress} isBackup={false} />
                                                </div>
                                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{new Date(record.transferDate * 1000).toLocaleDateString()}</p>
                                                {i === result.history.length - 1 && (
                                                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[8px] font-bold uppercase">Current</div>
                                                )}
                                            </div>
                                        )).reverse()}
                                    </div>
                                </section>
                            )}

                            <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-medium">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="uppercase tracking-widest">Verification</span>
                                        <span className="font-mono text-slate-400 uppercase">Decentralized Ledger</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="uppercase tracking-widest">Protocol</span>
                                        <span className="text-slate-400">WarrantyChain Core</span>
                                    </div>
                                </div>
                                <div className="text-center md:text-right">
                                    <p>© {new Date().getFullYear()} WARRANTYCHAIN AUTOMATED VERIFICATION</p>
                                    <p className="uppercase tracking-widest mt-1">Status: SECURE & AUTHENTICATED</p>
                                </div>
                            </footer>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default PublicVerify;
