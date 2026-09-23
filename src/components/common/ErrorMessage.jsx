export default function ErrorMessage({ message, onRetry }) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-container">
      <div>
        <strong>Có lỗi xảy ra</strong>

        <p>{message}</p>
      </div>

      {onRetry && (
        <button type="button" onClick={onRetry} className="secondary-button">
          Thử lại
        </button>
      )}
    </div>
  );
}
