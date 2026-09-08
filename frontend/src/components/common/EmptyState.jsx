const EmptyState = ({
  title = "Nothing here yet",
  message = "There is no data to display.",
}) => (
  <div className="empty-state">
    <svg
      width="56"
      height="56"
      viewBox="0 0 64 64"
      className="mx-auto mb-3 opacity-70"
      aria-hidden="true"
    >
      <ellipse cx="32" cy="46" rx="24" ry="6" fill="#c3e6c9" />
      <path
        d="M32 8c12.15 0 22 9.85 22 22 0 3.3-.73 6.43-2.03 9.24L32 27 12.03 39.24A21.9 21.9 0 0 1 10 30c0-12.15 9.85-22 22-22Z"
        fill="#9bd2a5"
      />
      <circle cx="24" cy="24" r="3" fill="#fff" opacity="0.6" />
      <circle cx="34" cy="16" r="2" fill="#fff" opacity="0.6" />
    </svg>
    <h2>{title}</h2>
    <p>{message}</p>
  </div>
);

export default EmptyState;
