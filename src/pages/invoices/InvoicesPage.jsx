import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  RefreshCw,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";

import useSearchFilters from "../../hooks/useSearchFilters";
import "../../styles/invoices.css";
import "../../styles/pagination.css";

import {
  getInvoiceApi,
  downloadInvoicePdfApi,
  searchInvoicesApi,
} from "../../api/invoiceApi";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";

import InvoiceTable from "../../components/invoices/InvoiceTable";
import InvoiceDetailModal from "../../components/invoices/InvoiceDetailModal";

const DEFAULT_FILTERS = {
  search: "",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  sortOrder: "desc",
};

export default function InvoicesPage() {
  const { filters, updateFilters, resetFilters } = useSearchFilters();
  const [searchParams] = useSearchParams();

  const [invoices, setInvoices] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState({
    ...DEFAULT_FILTERS,
    ...filters,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const currentPage = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(1, Number(filters.pageSize) || 10);

  useEffect(() => {
    setDraft({
      ...DEFAULT_FILTERS,
      ...filters,
    });
  }, [filters]);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = Object.fromEntries(searchParams.entries());

      const result = await searchInvoicesApi({
        ...params,
        page: Number(params.page) || 1,
        pageSize: Number(params.pageSize) || 10,
      });

      setInvoices(result.items ?? []);
      setTotalItems(result.totalItems ?? 0);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải danh sách hóa đơn.",
      );
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const setField = (name, value) => {
    setDraft((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (draft.fromDate && draft.toDate && draft.fromDate > draft.toDate) {
      setError("Ngày bắt đầu không được sau ngày kết thúc.");
      return;
    }

    if (
      (draft.minAmount !== "" && Number(draft.minAmount) < 0) ||
      (draft.maxAmount !== "" && Number(draft.maxAmount) < 0)
    ) {
      setError("Tổng tiền không được âm.");
      return;
    }

    if (
      draft.minAmount !== "" &&
      draft.maxAmount !== "" &&
      Number(draft.minAmount) > Number(draft.maxAmount)
    ) {
      setError("Tổng tiền tối thiểu không được lớn hơn tổng tiền tối đa.");
      return;
    }

    setError("");

    updateFilters({
      search: draft.search.trim(),
      fromDate: draft.fromDate,
      toDate: draft.toDate,
      minAmount: draft.minAmount,
      maxAmount: draft.maxAmount,
      sortBy: draft.sortBy,
      sortOrder: draft.sortOrder,
      page: 1,
    });
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_FILTERS });
    setError("");
    resetFilters();
  };

  const handlePageChange = (page) => {
    updateFilters({ page }, { resetPage: false });
  };

  const handlePageSizeChange = (size) => {
    updateFilters({ pageSize: size, page: 1 }, { resetPage: false });
  };

  const handleView = async (id) => {
    try {
      setError("");

      const data = await getInvoiceApi(id);
      setSelectedInvoice(data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải chi tiết hóa đơn.",
      );
    }
  };

  const handleDownload = async (invoice) => {
    try {
      setDownloadingId(invoice.id);
      setError("");

      const response = await downloadInvoicePdfApi(invoice.id);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Invoice_${invoice.invoiceCode}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải hóa đơn PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-toolbar">
        <div>
          <h2>Hóa đơn</h2>
          <p>Quản lý hóa đơn được tạo từ phiếu xuất đã duyệt</p>
        </div>

        <div className="page-toolbar-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadInvoices}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Làm mới
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError("")} />}

      <div className="content-card">
        <form className="invoice-search-panel" onSubmit={handleSearch}>
          <div className="invoice-search-main">
            <div className="search-box invoice-keyword">
              <Search size={18} />

              <input
                type="search"
                value={draft.search}
                onChange={(event) => setField("search", event.target.value)}
                placeholder="Mã hóa đơn, mã phiếu xuất, khách hàng..."
                aria-label="Tìm kiếm hóa đơn"
              />
            </div>

            <button type="submit" className="primary-button">
              <Search size={16} />
              Tìm kiếm
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowAdvanced((previous) => !previous)}
              aria-expanded={showAdvanced}
            >
              <SlidersHorizontal size={16} />
              Bộ lọc
              {showAdvanced ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              Đặt lại
            </button>
          </div>

          {showAdvanced && (
            <div className="invoice-advanced-filters">
              <div className="invoice-filter-field">
                <label htmlFor="invoice-from-date">Ngày tạo từ</label>
                <input
                  id="invoice-from-date"
                  type="date"
                  value={draft.fromDate}
                  onChange={(event) => setField("fromDate", event.target.value)}
                />
              </div>

              <div className="invoice-filter-field">
                <label htmlFor="invoice-to-date">Ngày tạo đến</label>
                <input
                  id="invoice-to-date"
                  type="date"
                  value={draft.toDate}
                  onChange={(event) => setField("toDate", event.target.value)}
                />
              </div>

              <div className="invoice-filter-field">
                <label htmlFor="invoice-min-amount">
                  Tổng tiền tối thiểu (₫)
                </label>
                <input
                  id="invoice-min-amount"
                  type="number"
                  min="0"
                  step="1000"
                  value={draft.minAmount}
                  onChange={(event) =>
                    setField("minAmount", event.target.value)
                  }
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="invoice-filter-field">
                <label htmlFor="invoice-max-amount">Tổng tiền tối đa (₫)</label>
                <input
                  id="invoice-max-amount"
                  type="number"
                  min="0"
                  step="1000"
                  value={draft.maxAmount}
                  onChange={(event) =>
                    setField("maxAmount", event.target.value)
                  }
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="invoice-filter-field">
                <label htmlFor="invoice-sort-by">Sắp xếp theo</label>
                <select
                  id="invoice-sort-by"
                  value={draft.sortBy}
                  onChange={(event) => setField("sortBy", event.target.value)}
                >
                  <option value="date">Ngày tạo</option>
                  <option value="code">Mã hóa đơn</option>
                  <option value="customer">Khách hàng</option>
                  <option value="amount">Tổng tiền</option>
                </select>
              </div>

              <div className="invoice-filter-field">
                <label htmlFor="invoice-sort-order">Thứ tự</label>
                <select
                  id="invoice-sort-order"
                  value={draft.sortOrder}
                  onChange={(event) =>
                    setField("sortOrder", event.target.value)
                  }
                >
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </select>
              </div>

              <div className="invoice-filter-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleReset}
                >
                  Xóa bộ lọc
                </button>

                <button type="submit" className="primary-button">
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="table-toolbar">
          <div className="table-count">{totalItems} hóa đơn</div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <InvoiceTable
              invoices={invoices}
              onView={handleView}
              onDownload={handleDownload}
              downloadingId={downloadingId}
            />

            <Pagination
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onDownload={handleDownload}
          downloading={downloadingId === selectedInvoice.id}
        />
      )}
    </div>
  );
}
