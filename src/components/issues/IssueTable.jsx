import { Eye, CheckCircle } from "lucide-react";

export default function IssueTable({ issues, canApprove, onView, onApprove }) {
  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString("vi-VN");
  };

  const getStatusLabel = (status) => {
    if (status === "Pending") return "Chờ duyệt";
    if (status === "Approved") return "Đã duyệt";

    return status;
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

  if (issues.length === 0) {
    return <div className="empty-state">Không có phiếu xuất nào.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mã phiếu</th>
            <th>Lý do</th>
            <th>Người lập</th>
            <th>Ngày xuất</th>
            <th>Trạng thái</th>
            <th>Hóa đơn</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>{issue.id}</td>

              <td>
                <strong>{issue.issueCode}</strong>
              </td>

              <td>{issue.reason}</td>

              <td>{issue.creatorName || "—"}</td>

              <td>{formatDate(issue.issueDate)}</td>

              <td>
                <span className={getStatusClass(issue.status)}>
                  {getStatusLabel(issue.status)}
                </span>
              </td>

              <td>
                {issue.hasInvoice ? (
                  <span className="status-badge status-approved">Có</span>
                ) : (
                  <span className="status-badge">Chưa có</span>
                )}
              </td>

              <td>
                <div className="table-actions">
                  <button
                    type="button"
                    className="icon-button"
                    title="Xem chi tiết"
                    onClick={() => onView(issue.id)}
                  >
                    <Eye size={17} />
                  </button>

                  {canApprove && issue.status === "Pending" && (
                    <button
                      type="button"
                      className="icon-button success"
                      title="Duyệt phiếu"
                      onClick={() => onApprove(issue)}
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
