import { motion } from 'framer-motion';

const HexProductCard = ({ product }) => {
    // Calculate progress arc
    const now = Math.floor(Date.now() / 1000);
    const total = product.warrantyEnd - product.warrantyStart;
    const elapsed = now - product.warrantyStart;
    const remainingRatio = Math.max(0, Math.min(1, 1 - (elapsed / total)));
    const isExpired = elapsed >= total;
    
    // SVG Circle Arc logic
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (remainingRatio * circumference);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ rotateY: 8, scale: 1.05 }}
            style={{ perspective: 1000 }}
            className="group relative w-64 h-72 mx-auto cursor-pointer"
        >
            {/* Hexagon Body */}
            <div 
                className="absolute inset-0 bg-slate-900 border border-white/10 flex flex-col items-center justify-between py-10 px-6 backdrop-blur-xl transition-colors group-hover:bg-slate-800"
                style={{ 
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    background: "rgba(15, 23, 42, 0.6)"
                }}
            >
                {/* Product Name & ID */}
                <div className="text-center">
                    <h3 className="text-lg font-bold text-white truncate w-32">{product.name}</h3>
                    <p className="text-xs text-cyan-400 font-mono mt-1">{product.id}</p>
                </div>

                {/* Radial Progress */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="absolute inset-0 transform -rotate-90 w-16 h-16">
                        {/* Background track */}
                        <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                        {/* Progress */}
                        <circle 
                            cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" 
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className={`transition-all duration-1000 ease-out ${isExpired ? 'text-red-500' : 'text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`} 
                        />
                    </svg>
                    <div className="text-xs font-bold text-white z-10">
                        {Math.round(remainingRatio * 100)}%
                    </div>
                </div>

                {/* Owner Tag */}
                <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active Owner</p>
                    <p className="text-xs text-slate-300 font-medium truncate w-32">{product.ownerName}</p>
                </div>
            </div>

            {/* Glowing Hover Border Illusion */}
            <div 
                className="absolute inset-0 bg-transparent border-[2px] border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity z-[-1]"
                style={{ 
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    filter: "blur(8px)"
                }}
            />
        </motion.div>
    );
};

export default HexProductCard;
