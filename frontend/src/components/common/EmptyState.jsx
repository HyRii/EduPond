const EmptyState = ({ title = "Nothing here yet", message = "There is no data to display." }) => (
  <div className="empty-state">
    <h2>{title}</h2>
    <p>{message}</p>
  </div>
);

export default EmptyState;
