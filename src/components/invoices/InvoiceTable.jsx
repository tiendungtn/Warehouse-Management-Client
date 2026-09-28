import { Download, Eye } from "lucide-react";

export default function InvoiceTable({
  invoices,
  onView,
  onDownload,
  downloadingId,
}) {
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

  if (!invoices || invoices.length === 0) {
    return (
      <div className="empty-state">
        <p>Chưa có hóa đơn nào.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã hóa đơn</th>
            <th>Phiếu xuất</th>
            <th>Khách hàng</th>
            <th>Ngày lập</th>
            <th>Tổng tiền</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <strong>{invoice.invoiceCode}</strong>
              </td>

              <td>
                <span className="invoice-issue-code">{invoice.issueCode}</span>
              </td>

              <td>{invoice.customerName || "—"}</td>

              <td>{formatDate(invoice.createdDate)}</td>

              <td className="currency-cell">
                {formatCurrency(invoice.totalAmount)}
              </td>

              <td>
                <div className="table-actions">
                  <button
                    type="button"
                    className="icon-button"
                    title="Xem chi tiết"
                    onClick={() => onView(invoice.id)}
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    type="button"
                    className="icon-button invoice-download-button"
                    title="Tải PDF"
                    disabled={downloadingId === invoice.id}
                    onClick={() => onDownload(invoice)}
                  >
                    <Download size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
