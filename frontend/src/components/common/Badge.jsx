const VARIANT_CLASS = {
  default: "badge",
  success: "badge badge-success",
  danger: "badge badge-danger",
  pending: "badge badge-pending",
  warning: "badge badge-warning",
};

/**
 * Badge
 * Small pill label. Pass `variant` explicitly, or leave it unset and
 * it will guess a sensible color from common status words (APPROVED,
 * REJECTED, PENDING, PUBLISHED, ...) so existing call sites that just
 * do <Badge>{request.status}</Badge> get colored automatically.
 */
const GUESS = {
  APPROVED: "success",
  ACTIVE: "success",
  PUBLISHED: "success",
  COMPLETED: "success",
  REJECTED: "danger",
  INACTIVE: "danger",
  FAILED: "danger",
  PENDING: "pending",
  DRAFT: "pending",
  SUBMITTED: "pending",
  UNDER_REVIEW: "pending",
};

const Badge = ({ children, variant }) => {
  const key = String(children || "").toUpperCase().replace(/\s+/g, "_");
  const resolved = variant || GUESS[key] || "default";

  return (
    <span className={VARIANT_CLASS[resolved] || VARIANT_CLASS.default}>
      {children}
    </span>
  );
};

export default Badge;
