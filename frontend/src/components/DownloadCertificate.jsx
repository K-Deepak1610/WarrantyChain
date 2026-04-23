import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, CheckCircle, Shield, Award, Calendar, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCodeDisplay from './QRCodeDisplay';
import { getBaseURL, getVerifyPageURL } from '../config';

const DownloadCertificate = ({ data, type = 'warranty' }) => {
    const certificateRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!certificateRef.current) return;
        setIsGenerating(true);

        try {
            // Wait for any potential re-renders or QR code generation
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate dimensions to fit the page while maintaining aspect ratio
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            // We want it to fill the page mostly, let's just stretch to width with padding
            const margin = 10;
            const targetWidth = pdfWidth - (margin * 2);
            const targetHeight = (imgHeight * targetWidth) / imgWidth;

            pdf.addImage(imgData, 'PNG', margin, margin, targetWidth, targetHeight);
            pdf.save(`WarrantyChain-${type === 'warranty' ? 'Certificate' : 'Ownership'}-${data.productId || 'doc'}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Format verification date
    const verificationDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6 mx-auto"
            >
                {isGenerating ? (
                    <span className="animate-pulse">Generating PDF...</span>
                ) : (
                    <>
                        <Download size={20} />
                        Download Certificate
                    </>
                )}
            </motion.button>

            {/* Hidden Certificate Template - Rendered off-screen but visible to html2canvas */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div
                    ref={certificateRef}
                    className="w-[1123px] h-[794px] bg-white text-slate-800 p-12 relative overflow-hidden flex flex-col"
                    style={{ fontFamily: "'Inter', sans-serif" }} // Ensure font is loaded or use system font
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#4f46e5_0%,_transparent_50%)]" />
                        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    </div>

                    {/* Decorative Border */}
                    <div className="absolute inset-4 border-4 border-double border-slate-200 pointer-events-none rounded-lg" />

                    {/* Header */}
                    <header className="flex justify-between items-center mb-12 border-b-2 border-slate-100 pb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl text-white">
                                <Shield size={40} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">WarrantyChain</h1>
                                <p className="text-slate-500 font-medium tracking-wide text-sm uppercase">Secure Blockchain Verification</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-black text-slate-100 tracking-tighter absolute right-0 -top-4 -z-10 select-none">
                                {type === 'warranty' ? 'WARRANTY' : 'OWNERSHIP'}
                            </div>
                            <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-widest">
                                Certificate of {type === 'warranty' ? 'Warranty' : 'Ownership'}
                            </h2>
                            <p className="text-slate-400 font-mono text-sm mt-1">
                                REF: {data.productId?.substring(0, 16).toUpperCase() || 'UNKNOWN'}...
                            </p>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 grid grid-cols-3 gap-12 relative z-10">
                        {/* Main Info */}
                        <div className="col-span-2 space-y-8">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Award size={120} className="text-indigo-600" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Product Details</h3>
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-slate-800">{data.productName || 'Product Name'}</h2>
                                    <p className="text-lg text-slate-600 font-mono">ID: {data.productId}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3 text-indigo-600">
                                        <User size={20} />
                                        <h4 className="font-bold text-sm uppercase">Current Owner</h4>
                                    </div>
                                    <p className="font-bold text-lg text-slate-800">{data.ownerName}</p>
                                    <p className="text-slate-500 text-sm">{data.ownerContact}</p>
                                    <div className="mt-2 pt-2 border-t border-slate-100">
                                        <p className="font-mono text-xs text-slate-400 break-all">{data.owner}</p>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3 text-indigo-600">
                                        <Calendar size={20} />
                                        <h4 className="font-bold text-sm uppercase">Verification Date</h4>
                                    </div>
                                    <p className="font-bold text-lg text-slate-800">{verificationDate}</p>
                                    <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                                        <CheckCircle size={14} />
                                        <span className="text-xs font-bold uppercase">Verified on Chain</span>
                                    </div>
                                </div>
                            </div>

                            {type === 'warranty' && (
                                <div className={`p-5 rounded-xl border-l-4 ${data.isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className={`font-bold ${data.isValid ? 'text-green-700' : 'text-red-700'}`}>
                                                Status: {data.isValid ? 'Active Warranty' : 'Expired Warranty'}
                                            </h4>
                                            <p className="text-slate-600 text-sm mt-1">
                                                Valid until: {data.warrantyEnd ? new Date(data.warrantyEnd * 1000).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-2xl font-black text-slate-300">
                                            {data.daysRemaining !== undefined ? `${data.daysRemaining} DAYS LEFT` : ''}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ownership History (if type is ownership and history is available) */}
                            {type === 'ownership' && data.history && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="font-bold text-sm text-slate-400 uppercase mb-2">History Highlights</h4>
                                    <div className="text-sm text-slate-600">
                                        Total Transfers: <span className="font-bold">{data.history.length}</span>
                                        <span className="mx-2">•</span>
                                        Original Owner: <span className="font-bold">{data.history[0]?.ownerName}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar / QR */}
                        <div className="flex flex-col justify-between items-center bg-slate-900 text-white p-8 rounded-2xl text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                            <div className="mt-4 mb-8">
                                <h3 className="font-bold text-lg mb-1">Scan to Verify</h3>
                                <p className="text-slate-400 text-xs">Scan this QR code anytime to verify the authenticity of this document on the blockchain.</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-2xl">
                                <QRCodeDisplay
                                    value={`${getVerifyPageURL()}?name=${encodeURIComponent(data.productName)}&id=${encodeURIComponent(data.productId)}&owner=${encodeURIComponent(data.ownerName)}&status=${data.isValid ? 'Active' : 'Expired'}&valid=${encodeURIComponent(data.warrantyEnd ? new Date(data.warrantyEnd * 1000).toLocaleDateString() : 'N/A')}`}
                                    size={180}
                                    title="" // No title inside the PDF generation component's QR
                                />
                            </div>

                            <div className="mt-8 space-y-4 w-full">
                                <div className="pt-4 border-t border-slate-800">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">Contract Address</p>
                                    <p className="font-mono text-[10px] text-slate-400 break-all mt-1">
                                        {data.contractAddress || '0x...'}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-800">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">Issuer Signature</p>
                                    <div className="font-handwriting text-2xl text-indigo-400 mt-2 font-serif italic">
                                        WarrantyChain
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 relative z-10">
                        <p>© {new Date().getFullYear()} WarrantyChain Decentralized Verification System</p>
                        <p>Generated on {verificationDate}</p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default DownloadCertificate;
