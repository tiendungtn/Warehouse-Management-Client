import { useCallback, useEffect, useState } from "react";
import {
  Download,
  Package,
  RefreshCw,
  Search,
  AlertTriangle,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import "../../styles/reports.css";
import "../../styles/pagination.css";

import {
  searchStockReportApi,
  exportStockReportApi,
} from "../../api/reportApi";
import { getCategoriesApi } from "../../api/categoryApi";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";

const DEFAULTS = {
  search: "",
  categoryId: "",
  stockFilter: "",
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
  sortBy: "stock",
  sortOrder: "asc",
  page: "1",
  pageSize: "10",
};

function readFilters(params) {
  const filters = { ...DEFAULTS };

  for (const key of Object.keys(DEFAULTS)) {
    if (params.has(key)) {
      filters[key] = params.get(key) ?? DEFAULTS[key];
    }
  }

  if (!["10", "20", "50"].includes(filters.pageSize)) {
    filters.pageSize = "10";
  }

  if (!/^\d+$/.test(filters.page) || Number(filters.page) < 1) {
    filters.page = "1";
  }

  if (!["code", "name", "price", "stock", "value"].includes(filters.sortBy)) {
    filters.sortBy = "stock";
  }

  if (!["asc", "desc"].includes(filters.sortOrder)) {
    filters.sortOrder = "asc";
  }

  if (
    !["", "instock", "lowstock", "outofstock"].includes(filters.stockFilter)
  ) {
    filters.stockFilter = "";
  }

  return filters;
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

export default function StockReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => readFilters(searchParams));
  const [report, setReport] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  // Đồng bộ bộ lọc khi người dùng Back/Forward trên trình duyệt.
  useEffect(() => {
    setFilters(readFilters(searchParams));
  }, [searchParams]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const applyFilters = (nextFilters, resetPage = true) => {
    const next = {
      ...nextFilters,
      page: resetPage ? "1" : nextFilters.page,
    };

    setFilters(next);

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(next)) {
      if (value !== "" && value !== DEFAULTS[key]) {
        params.set(key, value);
      }
    }

    setSearchParams(params);
  };

  const loadReport = useCallback(async () => {
    const current = readFilters(searchParams);

    try {
      setLoading(true);
      setError("");

      const data = await searchStockReportApi({
        search: current.search.trim(),
        categoryId: current.categoryId,
        stockFilter: current.stockFilter,
        minPrice: current.minPrice,
        maxPrice: current.maxPrice,
        minStock: current.minStock,
        maxStock: current.maxStock,
        sortBy: current.sortBy,
        sortOrder: current.sortOrder,
        page: Number(current.page),
        pageSize: Number(current.pageSize),
      });

      setReport(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Không thể tải báo cáo tồn kho.",
      );
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    getCategoriesApi()
      .then((data) => setCategories(data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (
      filters.minPrice !== "" &&
      filters.maxPrice !== "" &&
      Number(filters.minPrice) > Number(filters.maxPrice)
    ) {
      setError("Đơn giá tối thiểu không được lớn hơn đơn giá tối đa.");
      return;
    }

    if (
      filters.minStock !== "" &&
      filters.maxStock !== "" &&
      Number(filters.minStock) > Number(filters.maxStock)
    ) {
      setError("Tồn kho tối thiểu không được lớn hơn tồn kho tối đa.");
      return;
    }

    for (const key of ["minPrice", "maxPrice", "minStock", "maxStock"]) {
      if (filters[key] !== "" && Number(filters[key]) < 0) {
        setError("Đơn giá và số lượng tồn không được âm.");
        return;
      }
    }

    applyFilters(filters);
  };

  const handleReset = () => {
    setFilters(DEFAULTS);
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    applyFilters({ ...filters, page: String(page) }, false);
  };

  const handlePageSizeChange = (pageSize) => {
    applyFilters({
      ...filters,
      pageSize: String(pageSize),
      page: "1",
    });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");

      // Giữ nguyên endpoint CSV hiện có.
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

  const products = report?.products ?? [];
  const totalItems = report?.totalItems ?? 0;
  const currentPage = Number(filters.page);
  const pageSize = Number(filters.pageSize);

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
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Tìm mã sản phẩm, tên sản phẩm..."
            />
          </div>

          <select
            value={filters.categoryId}
            onChange={(event) => updateFilter("categoryId", event.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>

          <select
            value={filters.stockFilter}
            onChange={(event) =>
              updateFilter("stockFilter", event.target.value)
            }
          >
            <option value="">Tất cả trạng thái</option>
            <option value="instock">Còn hàng</option>
            <option value="lowstock">Sắp hết (1–5)</option>
            <option value="outofstock">Hết hàng</option>
          </select>

          <div className="stock-advanced-fields">
            <label>
              Đơn giá từ
              <input
                type="number"
                min="0"
                step="any"
                value={filters.minPrice}
                onChange={(event) =>
                  updateFilter("minPrice", event.target.value)
                }
                placeholder="Tối thiểu"
              />
            </label>

            <label>
              Đến
              <input
                type="number"
                min="0"
                step="any"
                value={filters.maxPrice}
                onChange={(event) =>
                  updateFilter("maxPrice", event.target.value)
                }
                placeholder="Tối đa"
              />
            </label>

            <label>
              Tồn từ
              <input
                type="number"
                min="0"
                step="1"
                value={filters.minStock}
                onChange={(event) =>
                  updateFilter("minStock", event.target.value)
                }
                placeholder="Tối thiểu"
              />
            </label>

            <label>
              Đến
              <input
                type="number"
                min="0"
                step="1"
                value={filters.maxStock}
                onChange={(event) =>
                  updateFilter("maxStock", event.target.value)
                }
                placeholder="Tối đa"
              />
            </label>
          </div>

          <label className="stock-sort-field">
            <ArrowUpDown size={16} />
            <select
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split(":");
                setFilters((previous) => ({
                  ...previous,
                  sortBy,
                  sortOrder,
                }));
              }}
            >
              <option value="stock:asc">Tồn kho tăng dần</option>
              <option value="stock:desc">Tồn kho giảm dần</option>
              <option value="name:asc">Tên A–Z</option>
              <option value="name:desc">Tên Z–A</option>
              <option value="code:asc">Mã tăng dần</option>
              <option value="code:desc">Mã giảm dần</option>
              <option value="price:asc">Đơn giá tăng dần</option>
              <option value="price:desc">Đơn giá giảm dần</option>
              <option value="value:asc">Giá trị tồn tăng dần</option>
              <option value="value:desc">Giá trị tồn giảm dần</option>
            </select>
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
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

      {loading && !report ? (
        <Loading text="Đang tải báo cáo tồn kho..." />
      ) : report ? (
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
                <span>
                  {formatNumber(totalItems)} sản phẩm phù hợp
                  {loading ? " · Đang cập nhật..." : ""}
                </span>
              </div>
            </div>

            {loading ? (
              <Loading text="Đang cập nhật dữ liệu..." />
            ) : (
              <StockTable products={products} />
            )}

            <Pagination
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function ReportStat({ icon, title, value, danger, warning }) {
  return (
    <div
      className={`report-stat-card ${danger ? "danger" : ""} ${
        warning ? "warning" : ""
      }`}
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
