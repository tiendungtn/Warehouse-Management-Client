import { X, Download } from "lucide-react";

export default function InvoiceDetailModal({
  invoice,
  onClose,
  onDownload,
  downloading,
}) {
  if (!invoice) {
    return null;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large invoice-detail-modal">
        <div className="modal-header">
          <div>
            <h2>{invoice.invoiceCode}</h2>

            <p>Chi tiết hóa đơn</p>
          </div>

          <button type="button" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="invoice-detail-info">
          <div>
            <span>Mã hóa đơn</span>
            <strong>{invoice.invoiceCode}</strong>
          </div>

          <div>
            <span>Phiếu xuất</span>
            <strong>{invoice.issueCode || "—"}</strong>
          </div>

          <div>
            <span>Khách hàng</span>
            <strong>{invoice.customerName || "—"}</strong>
          </div>

          <div>
            <span>Người lập phiếu</span>
            <strong>{invoice.creatorName || "—"}</strong>
          </div>

          <div>
            <span>Ngày lập</span>
            <strong>{formatDate(invoice.createdDate)}</strong>
          </div>
        </div>

        <div className="invoice-items-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>Đơn vị</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={`${item.productCode}-${index}`}>
                  <td>{index + 1}</td>

                  <td>
                    <div>
                      <strong>{item.productName}</strong>

                      <small>{item.productCode}</small>
                    </div>
                  </td>

                  <td>{item.unit || "—"}</td>

                  <td>{item.quantity}</td>

                  <td>{formatCurrency(item.unitPrice)}</td>

                  <td className="currency-cell">
                    {formatCurrency(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-total">
          <span>Tổng tiền</span>

          <strong>{formatCurrency(invoice.totalAmount)}</strong>
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={onClose}>
            Đóng
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => onDownload(invoice)}
            disabled={downloading}
          >
            <Download size={16} />

            {downloading ? "Đang tạo PDF..." : "Tải PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
