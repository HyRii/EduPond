import { useMemo } from "react";

/**
 * PondBackground
 * A decorative, fully non-interactive background that gives pages a
 * "floating on a pond" feeling: a soft water gradient, blurred lily-pad
 * blobs and a column of rising bubbles.
 *
 * variant="light" -> bright green/teal water (used on the landing page,
 *                     inside content areas)
 * variant="deep"  -> deep dusk pond (used behind the auth card)
 */
const PondBackground = ({ variant = "light", bubbleCount = 16, className = "" }) => {
  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, index) => {
      // deterministic pseudo-randomness so it doesn't reshuffle on re-render
      const seed = (index * 137.5) % 100;
      const size = 6 + ((index * 17) % 22);
      return {
        id: index,
        left: `${(seed + index * 5) % 100}%`,
        size,
        duration: 7 + ((index * 3) % 10),
        delay: -(index * 1.3) % 9,
      };
    });
  }, [bubbleCount]);

  const surfaceClass =
    variant === "deep" ? "bg-pond-surface-deep" : "bg-pond-surface";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${surfaceClass} ${className}`}
    >
      {/* blurred lily-pad blobs */}
      <div className="absolute -left-16 -top-16 h-64 w-64 rounded-blob bg-pond-300/30 blur-2xl animate-float-slow" />
      <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-blob-2 bg-water-300/25 blur-3xl animate-float" />
      <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-blob bg-lily-200/25 blur-3xl animate-float-slow" />

      {/* rising bubbles */}
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="pond-bubble bottom-0"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animation: `bubble-rise ${bubble.duration}s ease-in infinite`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      {/* water sheen highlight */}
      <div className="bg-radial-fade absolute inset-0" />

      {/* gentle wave line along the bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full text-white/10"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,64 C240,110 480,10 720,32 C960,54 1200,120 1440,72 L1440,120 L0,120 Z"
        />
      </svg>
    </div>
  );
};

export default PondBackground;
