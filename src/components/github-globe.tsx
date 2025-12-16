"use client";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useSpring } from "react-spring";
import { useTheme } from "next-themes";

export const GithubGlobe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  
  // ✅ NEW: Store the current rotation in a Ref so it survives theme changes
  const phiRef = useRef(0);
  
  const { theme } = useTheme();
  
  const [{ r }, api] = useSpring(() => ({
    r: 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 40,
      precision: 0.001,
    },
  }));

  useEffect(() => {
    let width = 0;
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
    window.addEventListener("resize", onResize);
    onResize();

    const isDark = theme === "dark";
    
    // ✅ Initialize rotation from the Ref (instead of 0)
    let phi = phiRef.current;

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: isDark ? 1 : 0, 
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: isDark ? [0.3, 0.3, 0.3] : [0.9, 0.9, 0.9], 
      glowColor: isDark ? [1, 1, 1] : [0.7, 0.7, 0.7], 
      markerColor: isDark ? [0.1, 0.8, 1] : [0.1, 0.6, 1], 
      
      markers: [
        // Gwalior, India
        { location: [26.2183, 78.1828], size: 0.1 }, 
      ],
      
      onRender: (state) => {
        // Automatic rotation
        if (!pointerInteracting.current) {
          phi += 0.005;
        }
        
        // Apply rotation + spring drag interaction
        state.phi = phi + r.get();
        state.width = width * 2;
        state.height = width * 2;
        
        // ✅ Save the current rotation back to the Ref
        phiRef.current = phi;
      },
    });

    setTimeout(() => (canvasRef.current!.style.opacity = "1"));
    
    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [theme]); // Re-runs on theme change, but phi is preserved via phiRef

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: 1,
        margin: "auto",
        position: "relative",
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          canvasRef.current!.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = "grab";
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            api.start({ r: delta / 200 });
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            api.start({ r: delta / 100 });
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          contain: "layout paint size",
          opacity: 0,
          transition: "opacity 1s ease",
        }}
      />
    </div>
  );
};