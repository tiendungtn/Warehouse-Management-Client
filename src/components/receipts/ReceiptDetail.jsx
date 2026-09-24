import { X } from "lucide-react";

export default function ReceiptDetail({ receipt, onClose }) {
  if (!receipt) {
    return null;
  }

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

  const statusLabel =
    receipt.status === "Pending"
      ? "Chờ duyệt"
      : receipt.status === "Approved"
        ? "Đã duyệt"
        : receipt.status;

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <div>
            <h2>{receipt.receiptCode}</h2>
            <p>Chi tiết phiếu nhập kho</p>
          </div>

          <button type="button" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="receipt-detail-info">
          <div>
            <span>Nhà cung cấp</span>
            <strong>{receipt.supplierName}</strong>
          </div>

          <div>
            <span>Người lập</span>
            <strong>{receipt.creatorName || "—"}</strong>
          </div>

          <div>
            <span>Ngày nhập</span>
            <strong>{formatDate(receipt.receiptDate)}</strong>
          </div>

          <div>
            <span>Trạng thái</span>
            <strong>{statusLabel}</strong>
          </div>
        </div>

        <div className="receipt-items-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn vị</th>
                <th>Số lượng</th>
                <th>Giá nhập</th>
                <th>Thành tiền</th>
              </tr>
            </thead>

            <tbody>
              {receipt.items?.map((item, index) => (
                <tr key={`${item.productId}-${index}`}>
                  <td>
                    <div>
                      <strong>{item.productName}</strong>
                      <small>{item.productCode}</small>
                    </div>
                  </td>

                  <td>{item.unit}</td>

                  <td>{item.quantity}</td>

                  <td>{formatCurrency(item.importPrice)}</td>

                  <td className="currency-cell">
                    {formatCurrency(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt-total">
          <span>Tổng tiền</span>
          <strong>{formatCurrency(receipt.totalAmount)}</strong>
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
