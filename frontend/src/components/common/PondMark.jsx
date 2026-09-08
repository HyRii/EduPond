/**
 * PondMark
 * Small reusable SVG brand icon: a lily pad with a blooming flower,
 * used in sidebars, the auth card and the landing hero.
 */
const PondMark = ({ size = 40, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    aria-hidden="true"
  >
    <circle cx="32" cy="32" r="30" fill="#bfe9e6" opacity="0.35" />
    <path
      d="M32 6c14.36 0 26 11.64 26 26 0 3.9-.86 7.6-2.4 10.92L32 32 18.4 42.92A25.9 25.9 0 0 1 6 32C6 17.64 17.64 6 32 6Z"
      fill="#4c9c5e"
    />
    <path
      d="M32 32 12 26.5M32 32 14.5 40M32 32 20 15M32 32 44 15.5M32 32 50 26"
      stroke="#1c3a24"
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.35"
    />
    <g transform="translate(32 32)">
      <ellipse rx="5.5" ry="9" fill="#fbd7ea" transform="rotate(0) translate(0 -9)" />
      <ellipse rx="5.5" ry="9" fill="#fbd7ea" transform="rotate(72) translate(0 -9)" />
      <ellipse rx="5.5" ry="9" fill="#fbd7ea" transform="rotate(144) translate(0 -9)" />
      <ellipse rx="5.5" ry="9" fill="#fbd7ea" transform="rotate(216) translate(0 -9)" />
      <ellipse rx="5.5" ry="9" fill="#fbd7ea" transform="rotate(288) translate(0 -9)" />
      <circle r="4.2" fill="#f6b93b" />
    </g>
  </svg>
);

export default PondMark;
