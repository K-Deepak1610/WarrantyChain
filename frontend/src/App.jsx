import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TransferOwnership from './pages/TransferOwnership';
import PublicVerify from './pages/PublicVerify';
import Register from './pages/Register';
import VerifyWarranty from './pages/VerifyWarranty';
import VerifyOwnership from './pages/VerifyOwnership';
import ManageProduct from './pages/ManageProduct';
import { WalletProvider, useWallet } from './context/WalletContext';
import LiveTicker from './components/LiveTicker';
import CommandPalette from './components/CommandPalette';
import { useState } from 'react';

// Protected Component
const ProtectedRoute = ({ children }) => {
    const { isConnected } = useWallet();
    if (!isConnected) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

const AppContent = () => {
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 overflow-hidden relative pb-8">
            <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
                <div className="perspective-grid" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
            </div>
            <Navbar setShowCommandPalette={setShowCommandPalette} />
            <CommandPalette isOpen={showCommandPalette} setIsOpen={setShowCommandPalette} />
            <div className="relative z-10">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}><Home /></motion.div>} />
                        <Route path="/dashboard" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}><Dashboard /></motion.div>} />

                        {/* Protected Features */}
                        <Route path="/register" element={<ProtectedRoute><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}><Register /></motion.div></ProtectedRoute>} />
                        <Route path="/transfer-ownership" element={<ProtectedRoute><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}><TransferOwnership /></motion.div></ProtectedRoute>} />
                        <Route path="/manage-product" element={<ProtectedRoute><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}><ManageProduct /></motion.div></ProtectedRoute>} />

                        {/* Public Features */}
                        <Route path="/verify-warranty" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}><VerifyWarranty /></motion.div>} />
                        <Route path="/verify-ownership" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}><VerifyOwnership /></motion.div>} />
                        <Route path="/verify/:productId" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}><PublicVerify /></motion.div>} />
                    </Routes>
                </AnimatePresence>
            </div>
            <LiveTicker />
        </div>
    );
};

function App() {
    return (
        <WalletProvider>
            <AppContent />
        </WalletProvider>
    );
}

export default App;
