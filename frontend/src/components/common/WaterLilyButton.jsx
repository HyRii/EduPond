/**
 * WaterLilyButton
 * A button shaped like a floating lily pad / lily bloom instead of a
 * plain rectangle, echoing the reference pond artwork.
 *
 * variant="leaf"  -> green lily-pad, veined texture (default, used for
 *                     most primary actions e.g. "View Course")
 * variant="bloom" -> pink/white lily flower gradient (used for the big
 *                     hero actions like Login / Register submit)
 *
 * `as` lets it render as a different element (e.g. react-router's
 * <Link>) while keeping the exact same look.
 */
const VARIANTS = {
  leaf: {
    base: "bg-linear-to-br from-pond-400 via-pond-500 to-pond-700 text-white",
    ring: "focus-visible:ring-pond-300",
    petal: "bg-lily-100",
  },
  bloom: {
    base: "bg-linear-to-br from-white via-lily-100 to-lily-300 text-lily-800",
    ring: "focus-visible:ring-lily-300",
    petal: "bg-gold-300",
  },
};

const WaterLilyButton = ({
  as: Component = "button",
  variant = "leaf",
  fullWidth = false,
  loading = false,
  disabled = false,
  className = "",
  children,
  ...rest
}) => {
  const styles = VARIANTS[variant] || VARIANTS.leaf;
  const isDisabled = disabled || loading;

  return (
    <Component
      {...rest}
      disabled={Component === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      className={[
        "group relative inline-flex select-none items-center justify-center gap-2",
        "rounded-blob px-8 py-3.5 text-sm font-bold tracking-wide",
        "border-none shadow-float transition-all duration-300 ease-out",
        "hover:rounded-blob-2 hover:-translate-y-0.5 hover:shadow-pond",
        "focus-visible:outline-none focus-visible:ring-4",
        "active:translate-y-0 active:shadow-pond-sm",
        styles.base,
        styles.ring,
        fullWidth ? "w-full" : "",
        isDisabled ? "pointer-events-none opacity-60" : "",
        className,
      ].join(" ")}
    >
      {/* leaf-vein / petal sheen texture */}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-leaf-vein opacity-70" />

      {/* small flower bud accent */}
      <span
        className={`pointer-events-none absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full ${styles.petal} shadow-sm ring-2 ring-white/70 transition-transform duration-300 group-hover:scale-125`}
      />

      <span className="relative flex items-center gap-2">
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
            />
          </svg>
        )}
        {children}
      </span>
    </Component>
  );
};

export default WaterLilyButton;
