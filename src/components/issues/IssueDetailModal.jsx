import { X } from "lucide-react";

export default function IssueDetailModal({ issue, onClose }) {
  if (!issue) {
    return null;
  }

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString("vi-VN");
  };

  const getStatusLabel = (status) => {
    if (status === "Pending") return "Chờ duyệt";
    if (status === "Approved") return "Đã duyệt";

    return status;
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <div>
            <h2>Chi tiết phiếu xuất</h2>
            <p>{issue.issueCode}</p>
          </div>

          <button type="button" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="detail-grid">
          <div>
            <span>Mã phiếu</span>
            <strong>{issue.issueCode}</strong>
          </div>

          <div>
            <span>Người lập</span>
            <strong>{issue.creatorName || "—"}</strong>
          </div>

          <div>
            <span>Ngày xuất</span>
            <strong>{formatDate(issue.issueDate)}</strong>
          </div>

          <div>
            <span>Trạng thái</span>
            <strong>{getStatusLabel(issue.status)}</strong>
          </div>

          <div className="detail-full">
            <span>Lý do</span>
            <strong>{issue.reason}</strong>
          </div>
        </div>

        <div className="detail-section">
          <h3>Sản phẩm</h3>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã SP</th>
                  <th>Sản phẩm</th>
                  <th>Đơn vị</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>

              <tbody>
                {issue.items.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.productCode}</td>
                    <td>{item.productName}</td>
                    <td>{item.unit}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unitPrice.toLocaleString("vi-VN")} ₫</td>
                    <td>{item.totalAmount.toLocaleString("vi-VN")} ₫</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan="5" className="total-label">
                    Tổng tiền
                  </td>
                  <td className="total-value">
                    {issue.totalAmount.toLocaleString("vi-VN")} ₫
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
