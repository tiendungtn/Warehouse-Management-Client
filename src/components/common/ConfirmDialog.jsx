export default function ConfirmDialog({
  open,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="confirm-dialog">
        <h3>{title}</h3>

        <p>{message}</p>

        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            {cancelText}
          </button>

          <button
            type="button"
            className={danger ? "danger-button" : "primary-button"}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
