import { useState } from "react";
import { CheckCircle, X } from "lucide-react";

export default function ApproveIssueModal({
  issue,
  onSubmit,
  onClose,
  submitting,
}) {
  const [customerName, setCustomerName] = useState("");

  if (!issue) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!customerName.trim()) {
      return;
    }

    await onSubmit(customerName.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-small">
        <div className="modal-header">
          <div>
            <h2>Duyệt phiếu xuất</h2>
            <p>{issue.issueCode}</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="approve-warning">
          <CheckCircle size={20} />

          <div>
            <strong>Xác nhận duyệt phiếu?</strong>

            <p>
              Khi duyệt, hệ thống sẽ trừ số lượng sản phẩm khỏi tồn kho và tạo
              hóa đơn.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customer-name">Tên khách hàng</label>

            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              maxLength={150}
              placeholder="Nhập tên khách hàng..."
              required
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !customerName.trim()}
            >
              {submitting ? "Đang duyệt..." : "Xác nhận duyệt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
