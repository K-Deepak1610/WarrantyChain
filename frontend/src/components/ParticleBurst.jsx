import { useEffect, useRef, useState } from 'react';

const ParticleBurst = ({ trigger, onComplete }) => {
    const canvasRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        if (!trigger) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const parent = canvas.parentElement;
        const width = parent.offsetWidth;
        const height = parent.offsetHeight;
        
        canvas.width = width;
        canvas.height = height;
        setCanvasSize({ w: width, h: height });

        const particles = [];
        const colors = ['#22d3ee', '#818cf8', '#34d399', '#ffffff'];
        
        // Generate 20 particles originating from the center
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: width / 2,
                y: height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }

        let animationFrameId;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let activeParticles = 0;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.life > 0) {
                    activeParticles++;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= p.decay;

                    ctx.globalAlpha = Math.max(0, p.life);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                }
            }

            if (activeParticles > 0) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (onComplete) onComplete();
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [trigger, onComplete]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-50 overflow-visible"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default ParticleBurst;
