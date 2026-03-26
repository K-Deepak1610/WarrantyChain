import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, SearchCheck, MoveRight, ArrowRight, Download, X } from 'lucide-react';

const actions = [
    { id: 'register', title: 'Register New Product', icon: Plus, path: '/register', color: 'text-cyan-400' },
    { id: 'verify', title: 'Verify Warranty', icon: SearchCheck, path: '/verify-warranty', color: 'text-emerald-400' },
    { id: 'transfer', title: 'Transfer Ownership', icon: MoveRight, path: '/transfer-ownership', color: 'text-orange-400' },
    { id: 'ownership', title: 'Check Ownership History', icon: Search, path: '/verify-ownership', color: 'text-purple-400' }
];

const CommandPalette = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(open => !open);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setIsOpen]);

    const filteredActions = actions.filter(action =>
        action.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (path) => {
        setIsOpen(false);
        setSearch('');
        navigate(path);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)] overflow-hidden"
                    >
                        <div className="flex items-center px-4 py-3 border-b border-white/10">
                            <Search className="text-slate-400" size={20} />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="What do you need to do? (Connect wallet first)"
                                className="w-full bg-transparent border-none outline-none text-white px-3 py-2 placeholder-slate-500 font-sans"
                            />
                            <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10">ESC</div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {filteredActions.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">No commands found.</div>
                            ) : (
                                filteredActions.map((action, index) => (
                                    <button
                                        key={action.id}
                                        onClick={() => handleSelect(action.path)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${action.color}`}>
                                                <action.icon size={18} />
                                            </div>
                                            <span className="text-slate-300 group-hover:text-white font-medium">{action.title}</span>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
