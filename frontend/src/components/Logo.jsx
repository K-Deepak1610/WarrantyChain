import { motion } from 'framer-motion';

const Logo = ({ size = 'md', className = '' }) => {
    // Sizes
    const sizes = {
        sm: { icon: 24, text: 'text-lg', gap: 'gap-1.5' },
        md: { icon: 32, text: 'text-2xl', gap: 'gap-2' },
        lg: { icon: 64, text: 'text-6xl md:text-8xl', gap: 'gap-6' }
    };

    const s = sizes[size] || sizes.md;

    const iconAnimation = size === 'lg' ? {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: "spring", stiffness: 200, damping: 15 }
    } : {};

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className={`flex items-center ${s.gap}`}>
                <motion.div
                    {...iconAnimation}
                    className="relative flex items-center justify-center drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]"
                >
                    {/* SVG Shield/Hexagon */}
                    <svg
                        width={s.icon}
                        height={s.icon}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="overflow-visible"
                    >
                        <defs>
                            <linearGradient id="logoGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#22d3ee" />
                                <stop offset="1" stopColor="#818cf8" />
                            </linearGradient>
                        </defs>
                        {/* Hexagon Outline */}
                        <motion.path
                            initial={size === 'lg' ? { rotate: 0 } : false}
                            animate={size === 'lg' ? { rotate: [0, 360] } : false}
                            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                            style={{ originX: "12px", originY: "12px" }}
                            d="M21 16.0592V7.94084C21 7.22851 20.6186 6.57444 19.9983 6.21633L13.0017 2.17696C12.3846 1.82062 11.6154 1.82062 10.9983 2.17696L4.00171 6.21633C3.38139 6.57444 3 7.22851 3 7.94084V16.0592C3 16.7715 3.38139 17.4256 4.00171 17.7837L10.9983 21.823C11.6154 22.1794 12.3846 22.1794 13.0017 21.823L19.9983 17.7837C20.6186 17.4256 21 16.7715 21 16.0592Z"
                            stroke="url(#logoGradient)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="rgba(34,211,238,0.1)"
                        />
                        {/* Inner Checkmark */}
                        <path
                            d="M9 12L11 14L15 10"
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </motion.div>

                {size !== 'sm' && (
                    <motion.div
                        initial={size === 'lg' ? { opacity: 0 } : false}
                        animate={size === 'lg' ? { opacity: 1 } : false}
                        transition={{ delay: size === 'lg' ? 0.3 : 0, duration: 0.5 }}
                        className={`${s.text} font-bold tracking-tight whitespace-nowrap`}
                    >
                        <span className="text-white font-semibold">Warranty</span>
                        <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]">Chain</span>
                    </motion.div>
                )}
            </div>

            {size === 'lg' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-6 text-slate-300 tracking-widest uppercase mb-8 max-w-2xl font-mono glass-card px-8 py-3 rounded-2xl border-white/5 font-bold text-lg md:text-xl"
                >
                    On-Chain Warranty Protocol
                </motion.div>
            )}
        </div>
    );
};

export default Logo;
