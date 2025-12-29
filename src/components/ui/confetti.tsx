import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiProps {
  active: boolean;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  'hsl(43, 96%, 56%)',   // Gold/amber
  'hsl(24, 100%, 65%)',  // Warm orange
  'hsl(16, 100%, 70%)',  // Coral
  'hsl(48, 96%, 53%)',   // Yellow gold
  'hsl(34, 100%, 50%)',  // Deep amber
  'hsl(45, 93%, 47%)',   // Rich gold
];

export function Confetti({ active, className }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();

    // Create particles
    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = 80;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: -20 - Math.random() * 100,
          size: Math.random() * 8 + 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          velocity: {
            x: (Math.random() - 0.5) * 4,
            y: Math.random() * 3 + 2,
          },
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1,
        });
      }
      return particles;
    };

    particlesRef.current = createParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particlesRef.current = particlesRef.current.filter((p) => {
        // Update position
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.rotation += p.rotationSpeed;
        p.velocity.y += 0.1; // Gravity
        p.velocity.x *= 0.99; // Air resistance

        // Fade out near bottom
        if (p.y > canvas.offsetHeight * 0.7) {
          p.opacity -= 0.02;
        }

        // Draw particle
        if (p.opacity > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          
          // Draw rectangle shape
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          
          ctx.restore();
          return true;
        }
        return false;
      });

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 pointer-events-none z-50', className)}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
