import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import VerifyWarranty from './pages/VerifyWarranty';
import VerifyOwnership from './pages/VerifyOwnership';
import TransferOwnership from './pages/TransferOwnership';
import PublicVerify from './pages/PublicVerify';
import { WalletProvider, useWallet } from './context/WalletContext';

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
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />
            <Navbar />
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
