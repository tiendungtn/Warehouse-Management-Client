import { useEffect, useState } from "react";
import { CalendarDays, RefreshCw, TrendingUp } from "lucide-react";

import "../../styles/reports.css";

import { getRevenueReportApi } from "../../api/reportApi";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function RevenueReportPage() {
  const [report, setReport] = useState(null);

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRevenueReportApi({
        fromDate,
        toDate,
      });

      setReport(data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải báo cáo doanh thu.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    loadReport();
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");

    setTimeout(() => {
      loadReport();
    }, 0);
  };

  if (loading && !report) {
    return <Loading text="Đang tải báo cáo doanh thu..." />;
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h2>Báo cáo doanh thu</h2>

          <p>Theo dõi doanh thu từ các hóa đơn đã phát sinh.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={loadReport}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="page-alert">
          <ErrorMessage message={error} onRetry={loadReport} />
        </div>
      )}

      <div className="report-filter-card">
        <form className="revenue-filter-form" onSubmit={handleSubmit}>
          <div className="date-field">
            <label htmlFor="fromDate">Từ ngày</label>

            <div className="date-input">
              <CalendarDays size={17} />

              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </div>
          </div>

          <div className="date-field">
            <label htmlFor="toDate">Đến ngày</label>

            <div className="date-input">
              <CalendarDays size={17} />

              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="primary-button">
            <TrendingUp size={16} />
            Xem báo cáo
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handleReset}
          >
            Đặt lại
          </button>
        </form>
      </div>

      {report && (
        <>
          <div className="revenue-summary-card">
            <div className="revenue-summary-icon">
              <TrendingUp size={24} />
            </div>

            <div>
              <div className="revenue-summary-label">Tổng doanh thu</div>

              <div className="revenue-summary-value">
                {formatCurrency(report.totalRevenue)}
              </div>

              <div className="revenue-summary-period">
                {formatDateRange(report.fromDate, report.toDate)}
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="report-table-header">
              <div>
                <h3>Chi tiết doanh thu</h3>

                <span>{report.invoices?.length || 0} hóa đơn</span>
              </div>
            </div>

            <RevenueTable invoices={report.invoices || []} />
          </div>
        </>
      )}
    </div>
  );
}

function RevenueTable({ invoices }) {
  if (!invoices.length) {
    return (
      <div className="empty-state">
        <TrendingUp size={32} />

        <h3>Không có dữ liệu</h3>

        <p>Không có hóa đơn trong khoảng thời gian đã chọn.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã hóa đơn</th>
            <th>Mã phiếu xuất</th>
            <th>Khách hàng</th>
            <th>Ngày lập</th>
            <th>Tổng tiền</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <strong>{invoice.invoiceCode}</strong>
              </td>

              <td>{invoice.issueCode}</td>

              <td>{invoice.customerName || "—"}</td>

              <td>{formatDateTime(invoice.createdDate)}</td>

              <td className="revenue-value">
                {formatCurrency(invoice.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatDateRange(from, to) {
  if (!from && !to) {
    return "Toàn bộ thời gian";
  }

  if (from && to) {
    return `${formatDate(from)} → ${formatDate(to)}`;
  }

  if (from) {
    return `Từ ${formatDate(from)}`;
  }

  return `Đến ${formatDate(to)}`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("vi-VN");
}
