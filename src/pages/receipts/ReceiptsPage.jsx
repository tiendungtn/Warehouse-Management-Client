import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import useSearchFilters from "../../hooks/useSearchFilters";
import "../../styles/receipts.css";
import "../../styles/pagination.css";

import {
  getReceiptApi,
  createReceiptApi,
  approveReceiptApi,
  searchReceiptsApi,
} from "../../api/receiptApi";

import { getProductsApi } from "../../api/productApi";
import { useAuth } from "../../context/AuthContext";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";

import ReceiptTable from "../../components/receipts/ReceiptTable";
import ReceiptForm from "../../components/receipts/ReceiptForm";
import ReceiptDetail from "../../components/receipts/ReceiptDetail";

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  sortOrder: "desc",
};

export default function ReceiptsPage() {
  const { user } = useAuth();
  const { filters, updateFilters, resetFilters } = useSearchFilters();
  const [searchParams] = useSearchParams();

  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState({
    ...DEFAULT_FILTERS,
    ...filters,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptToApprove, setReceiptToApprove] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);

  const canApprove = user?.role === "Admin" || user?.role === "Manager";

  const currentPage = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(1, Number(filters.pageSize) || 10);

  useEffect(() => {
    setDraft({
      ...DEFAULT_FILTERS,
      ...filters,
    });
  }, [filters]);

  const loadReceipts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = Object.fromEntries(searchParams.entries());

      const result = await searchReceiptsApi({
        ...params,
        page: Number(params.page) || 1,
        pageSize: Number(params.pageSize) || 10,
      });

      setReceipts(result.items ?? []);
      setTotalItems(result.totalItems ?? 0);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải danh sách phiếu nhập.",
      );
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await getProductsApi();
      setProducts(data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải danh sách sản phẩm.",
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

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
      draft.minAmount !== "" &&
      draft.maxAmount !== "" &&
      Number(draft.minAmount) > Number(draft.maxAmount)
    ) {
      setError("Tổng tiền tối thiểu không được lớn hơn tổng tiền tối đa.");
      return;
    }

    if (
      (draft.minAmount !== "" && Number(draft.minAmount) < 0) ||
      (draft.maxAmount !== "" && Number(draft.maxAmount) < 0)
    ) {
      setError("Tổng tiền không được âm.");
      return;
    }

    setError("");

    updateFilters({
      search: draft.search.trim(),
      status: draft.status,
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

  const handleCreate = async (payload) => {
    try {
      setSubmitting(true);
      setError("");

      await createReceiptApi(payload);
      setShowForm(false);

      await loadReceipts();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tạo phiếu nhập.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (id) => {
    try {
      setError("");
      const data = await getReceiptApi(id);
      setSelectedReceipt(data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải chi tiết phiếu nhập.",
      );
    }
  };

  const handleApprove = async () => {
    if (!receiptToApprove) return;

    try {
      setApproving(true);
      setError("");

      await approveReceiptApi(receiptToApprove.id);
      setReceiptToApprove(null);

      await loadReceipts();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể duyệt phiếu nhập.");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-toolbar">
        <div>
          <h2>Phiếu nhập</h2>
          <p>Quản lý phiếu nhập kho</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowForm(true)}
          disabled={loadingProducts}
        >
          <Plus size={18} />
          Thêm phiếu nhập
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadReceipts} />}

      <section className="receipt-search-panel">
        <form onSubmit={handleSearch}>
          <div className="receipt-search-main">
            <div className="receipt-keyword">
              <Search size={18} />
              <input
                type="search"
                value={draft.search}
                onChange={(event) => setField("search", event.target.value)}
                placeholder="Tìm mã phiếu, nhà cung cấp, người lập..."
                aria-label="Từ khóa tìm phiếu nhập"
              />
            </div>

            <button type="submit" className="primary-button">
              <Search size={16} />
              Tìm kiếm
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowAdvanced((value) => !value)}
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
            <div className="receipt-advanced-filters">
              <div className="receipt-filter-field">
                <label htmlFor="receipt-status">Trạng thái</label>
                <select
                  id="receipt-status"
                  value={draft.status}
                  onChange={(event) => setField("status", event.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Pending">Chờ duyệt</option>
                  <option value="Approved">Đã duyệt</option>
                </select>
              </div>

              <div className="receipt-filter-field">
                <label htmlFor="receipt-from-date">Từ ngày</label>
                <input
                  id="receipt-from-date"
                  type="date"
                  value={draft.fromDate}
                  onChange={(event) => setField("fromDate", event.target.value)}
                />
              </div>

              <div className="receipt-filter-field">
                <label htmlFor="receipt-to-date">Đến ngày</label>
                <input
                  id="receipt-to-date"
                  type="date"
                  value={draft.toDate}
                  onChange={(event) => setField("toDate", event.target.value)}
                />
              </div>

              <div className="receipt-filter-field">
                <label htmlFor="receipt-min-amount">
                  Tổng tiền tối thiểu (₫)
                </label>
                <input
                  id="receipt-min-amount"
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

              <div className="receipt-filter-field">
                <label htmlFor="receipt-max-amount">Tổng tiền tối đa (₫)</label>
                <input
                  id="receipt-max-amount"
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

              <div className="receipt-filter-field">
                <label htmlFor="receipt-sort-by">Sắp xếp theo</label>
                <select
                  id="receipt-sort-by"
                  value={draft.sortBy}
                  onChange={(event) => setField("sortBy", event.target.value)}
                >
                  <option value="date">Ngày nhập</option>
                  <option value="code">Mã phiếu</option>
                  <option value="supplier">Nhà cung cấp</option>
                  <option value="amount">Tổng tiền</option>
                  <option value="status">Trạng thái</option>
                </select>
              </div>

              <div className="receipt-filter-field">
                <label htmlFor="receipt-sort-order">Thứ tự</label>
                <select
                  id="receipt-sort-order"
                  value={draft.sortOrder}
                  onChange={(event) =>
                    setField("sortOrder", event.target.value)
                  }
                >
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </select>
              </div>

              <div className="receipt-filter-actions">
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
      </section>

      {loading ? (
        <Loading />
      ) : (
        <>
          <ReceiptTable
            receipts={receipts}
            canApprove={canApprove}
            onView={handleView}
            onApprove={setReceiptToApprove}
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

      <ReceiptForm
        open={showForm}
        products={products}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        submitting={submitting}
      />

      <ReceiptDetail
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <ConfirmDialog
        open={!!receiptToApprove}
        title="Duyệt phiếu nhập"
        message={
          receiptToApprove
            ? `Bạn có chắc muốn duyệt phiếu ${receiptToApprove.receiptCode}? Sau khi duyệt, số lượng tồn kho của các sản phẩm sẽ được cập nhật.`
            : ""
        }
        confirmText={approving ? "Đang duyệt..." : "Duyệt phiếu"}
        cancelText="Hủy"
        onConfirm={handleApprove}
        onCancel={() => {
          if (!approving) setReceiptToApprove(null);
        }}
        loading={approving}
      />
    </div>
  );
}
