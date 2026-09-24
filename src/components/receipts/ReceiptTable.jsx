import { Eye, CheckCircle } from "lucide-react";

export default function ReceiptTable({
  receipts,
  canApprove,
  onView,
  onApprove,
}) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const getStatusLabel = (status) => {
    if (status === "Pending") return "Chờ duyệt";
    if (status === "Approved") return "Đã duyệt";

    return status || "—";
  };

  const getStatusClass = (status) => {
    if (status === "Pending") {
      return "status-badge status-pending";
    }

    if (status === "Approved") {
      return "status-badge status-approved";
    }

    return "status-badge";
  };

  if (!receipts || receipts.length === 0) {
    return (
      <div className="empty-state">
        <p>Chưa có phiếu nhập nào.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã phiếu</th>
            <th>Nhà cung cấp</th>
            <th>Người lập</th>
            <th>Ngày nhập</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th className="action-column">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {receipts.map((receipt) => (
            <tr key={receipt.id}>
              <td>
                <strong>{receipt.receiptCode}</strong>
              </td>

              <td>{receipt.supplierName}</td>

              <td>{receipt.creatorName || "—"}</td>

              <td>{formatDate(receipt.receiptDate)}</td>

              <td className="currency-cell">
                {formatCurrency(receipt.totalAmount)}
              </td>

              <td>
                <span className={getStatusClass(receipt.status)}>
                  {getStatusLabel(receipt.status)}
                </span>
              </td>

              <td>
                <div className="table-actions">
                  <button
                    type="button"
                    className="icon-button"
                    title="Xem chi tiết"
                    onClick={() => onView(receipt.id)}
                  >
                    <Eye size={17} />
                  </button>

                  {canApprove && receipt.status === "Pending" && (
                    <button
                      type="button"
                      className="icon-button approve-button"
                      title="Duyệt phiếu"
                      onClick={() => onApprove(receipt)}
                    >
                      <CheckCircle size={17} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
