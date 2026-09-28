import { useEffect, useState } from "react";
import {
  Download,
  Package,
  RefreshCw,
  Search,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import "../../styles/reports.css";

import { getStockReportApi, exportStockReportApi } from "../../api/reportApi";

import { getCategoriesApi } from "../../api/categoryApi";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function StockReportPage() {
  const [report, setReport] = useState(null);

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const [stockFilter, setStockFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStockReportApi({
        search,
        categoryId,
        stockFilter,
      });

      setReport(data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải báo cáo tồn kho.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategoriesApi();

      setCategories(data || []);
    } catch {
      // Không chặn báo cáo nếu danh mục không tải được
    }
  };

  useEffect(() => {
    loadCategories();
    loadReport();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    loadReport();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");

      const response = await exportStockReportApi();

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = "BaoCaoTonKho.csv";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể xuất báo cáo tồn kho.",
      );
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setSearch("");
    setCategoryId("");
    setStockFilter("");

    setTimeout(() => {
      loadReport();
    }, 0);
  };

  if (loading && !report) {
    return <Loading text="Đang tải báo cáo tồn kho..." />;
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h2>Báo cáo tồn kho</h2>

          <p>Theo dõi số lượng và giá trị hàng hóa trong kho.</p>
        </div>

        <div className="report-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadReport}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Làm mới
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download size={17} />

            {exporting ? "Đang xuất..." : "Xuất CSV"}
          </button>
        </div>
      </div>

      {error && (
        <div className="page-alert">
          <ErrorMessage message={error} onRetry={loadReport} />
        </div>
      )}

      <div className="report-filter-card">
        <form className="report-filter-form" onSubmit={handleSearch}>
          <div className="report-search">
            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã sản phẩm, tên sản phẩm..."
            />
          </div>

          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
            }}
          >
            <option value="">Tất cả danh mục</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) => {
              setStockFilter(event.target.value);
            }}
          >
            <option value="">Tất cả trạng thái</option>

            <option value="instock">Còn hàng</option>

            <option value="lowstock">Sắp hết</option>

            <option value="outofstock">Hết hàng</option>
          </select>

          <button type="submit" className="primary-button">
            <Search size={16} />
            Tìm kiếm
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
          <div className="report-stats-grid">
            <ReportStat
              icon={<Package size={21} />}
              title="Tổng sản phẩm"
              value={formatNumber(report.totalProductCount)}
            />

            <ReportStat
              icon={<Package size={21} />}
              title="Tổng số lượng tồn"
              value={formatNumber(report.totalStockQuantity)}
            />

            <ReportStat
              icon={<Package size={21} />}
              title="Giá trị tồn kho"
              value={formatCurrency(report.totalStockValuation)}
            />

            <ReportStat
              icon={<XCircle size={21} />}
              title="Hết hàng"
              value={formatNumber(report.outOfStockCount)}
              danger
            />

            <ReportStat
              icon={<AlertTriangle size={21} />}
              title="Sắp hết"
              value={formatNumber(report.lowStockCount)}
              warning
            />
          </div>

          <div className="content-card">
            <div className="report-table-header">
              <div>
                <h3>Chi tiết tồn kho</h3>

                <span>{report.products?.length || 0} sản phẩm</span>
              </div>
            </div>

            <StockTable products={report.products || []} />
          </div>
        </>
      )}
    </div>
  );
}

function ReportStat({ icon, title, value, danger, warning }) {
  return (
    <div
      className={`report-stat-card ${
        danger ? "danger" : ""
      } ${warning ? "warning" : ""}`}
    >
      <div className="report-stat-icon">{icon}</div>

      <div>
        <div className="report-stat-title">{title}</div>

        <div className="report-stat-value">{value}</div>
      </div>
    </div>
  );
}

function StockTable({ products }) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <Package size={32} />

        <h3>Không có dữ liệu</h3>

        <p>Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã sản phẩm</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>ĐVT</th>
            <th>Đơn giá</th>
            <th>Tồn kho</th>
            <th>Giá trị tồn</th>
            <th>Trạng thái</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.productId}>
              <td>
                <strong>{product.productCode}</strong>
              </td>

              <td>{product.productName}</td>

              <td>{product.categoryName || "—"}</td>

              <td>{product.unit || "—"}</td>

              <td>{formatCurrency(product.price)}</td>

              <td>
                <strong>{formatNumber(product.stockQuantity)}</strong>
              </td>

              <td>{formatCurrency(product.totalValuation)}</td>

              <td>
                <StockStatus status={product.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StockStatus({ status }) {
  if (status === "OutOfStock") {
    return <span className="report-status out">Hết hàng</span>;
  }

  if (status === "LowStock") {
    return <span className="report-status low">Sắp hết</span>;
  }

  return <span className="report-status in">Còn hàng</span>;
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}
