import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TransferOwnership from './pages/TransferOwnership';
import PublicVerify from './pages/PublicVerify';
import Register from './pages/Register';
import VerifyWarranty from './pages/VerifyWarranty';
import VerifyOwnership from './pages/VerifyOwnership';
import { WalletProvider, useWallet } from './context/WalletContext';
import LiveTicker from './components/LiveTicker';
import CommandPalette from './components/CommandPalette';
import { useState } from 'react';

// Protected Component
const ProtectedRoute = ({ children }) => {
    const { isConnected } = useWallet();
    if (!isConnected) {
        return (
            <div className="pt-32 text-center text-slate-400">
                <p>Please connect your wallet to access this feature.</p>
                <Navigate to="/dashboard" replace />
            </div>
        );
    }
    return children;
};

const AppContent = () => {
    const [showCommandPalette, setShowCommandPalette] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 overflow-hidden relative pb-8">
            <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
                <div className="perspective-grid" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
            </div>
            <Navbar setShowCommandPalette={setShowCommandPalette} />
            <CommandPalette isOpen={showCommandPalette} setIsOpen={setShowCommandPalette} />
            <div className="relative z-10">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Protected Features */}
                    <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
                    <Route path="/transfer-ownership" element={<ProtectedRoute><TransferOwnership /></ProtectedRoute>} />

                    {/* Public Features (can fail gracefully if no wallet, handled in page) */}
                    <Route path="/verify-warranty" element={<VerifyWarranty />} />
                    <Route path="/verify-ownership" element={<VerifyOwnership />} />
                    <Route path="/verify/:productId" element={<PublicVerify />} />
                </Routes>
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
