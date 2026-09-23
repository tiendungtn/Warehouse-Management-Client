export default function Loading({ text = "Đang tải..." }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <span>{text}</span>
    </div>
  );
}
