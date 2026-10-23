import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import useSearchFilters from "../../hooks/useSearchFilters";

import "../../styles/issues.css";
import "../../styles/pagination.css";

import {
  getIssueApi,
  createIssueApi,
  approveIssueApi,
  searchIssuesApi,
} from "../../api/issueApi";

import { getProductsApi } from "../../api/productApi";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";

import IssueTable from "../../components/issues/IssueTable";
import IssueForm from "../../components/issues/IssueForm";
import IssueDetailModal from "../../components/issues/IssueDetailModal";
import ApproveIssueModal from "../../components/issues/ApproveIssueModal";

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  hasInvoice: "",
  fromDate: "",
  toDate: "",
  sortBy: "date",
  sortOrder: "desc",
};

export default function IssuesPage() {
  const { user } = useAuth();
  const { filters, updateFilters, resetFilters } = useSearchFilters();
  const [searchParams] = useSearchParams();

  const [issues, setIssues] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState({
    ...DEFAULT_FILTERS,
    ...filters,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueToApprove, setIssueToApprove] = useState(null);

  const canApprove = user?.role === "Admin" || user?.role === "Manager";

  const currentPage = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(1, Number(filters.pageSize) || 10);

  useEffect(() => {
    setDraft({
      ...DEFAULT_FILTERS,
      ...filters,
    });
  }, [filters]);

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = Object.fromEntries(searchParams.entries());

      const result = await searchIssuesApi({
        ...params,
        page: Number(params.page) || 1,
        pageSize: Number(params.pageSize) || 10,
      });

      setIssues(result.items ?? []);
      setTotalItems(result.totalItems ?? 0);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải danh sách phiếu xuất.",
      );
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);

      const result = await getProductsApi();
      setProducts(result ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải danh sách sản phẩm.",
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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

    setError("");

    updateFilters({
      search: draft.search.trim(),
      status: draft.status,
      hasInvoice: draft.hasInvoice,
      fromDate: draft.fromDate,
      toDate: draft.toDate,
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

  const handleCreate = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      await createIssueApi(data);
      setShowForm(false);

      await loadIssues();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tạo phiếu xuất.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (id) => {
    try {
      setError("");

      const data = await getIssueApi(id);
      setSelectedIssue(data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải chi tiết phiếu xuất.",
      );
    }
  };

  const handleApprove = async (customerName) => {
    if (!issueToApprove) return;

    try {
      setSubmitting(true);
      setError("");

      await approveIssueApi(issueToApprove.id, customerName);
      setIssueToApprove(null);

      await loadIssues();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể duyệt phiếu xuất.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-toolbar">
        <div>
          <h2>Phiếu xuất kho</h2>
          <p>Quản lý các phiếu xuất và quá trình duyệt xuất kho</p>
        </div>

        <div className="page-toolbar-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadIssues}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Làm mới
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={loadingProducts}
          >
            <Plus size={17} />
            Tạo phiếu xuất
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError("")} />}

      <div className="content-card">
        <form className="issue-search-panel" onSubmit={handleSearch}>
          <div className="issue-search-main">
            <div className="search-box issue-keyword">
              <Search size={18} />

              <input
                type="search"
                value={draft.search}
                onChange={(event) => setField("search", event.target.value)}
                placeholder="Tìm mã phiếu, lý do, người lập..."
                aria-label="Tìm kiếm phiếu xuất"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Search size={16} />
              Tìm kiếm
            </button>

            <button
              type="button"
              className="btn btn-secondary"
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
              className="btn btn-secondary"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              Đặt lại
            </button>
          </div>

          {showAdvanced && (
            <div className="issue-advanced-filters">
              <div className="issue-filter-field">
                <label htmlFor="issue-status">Trạng thái</label>
                <select
                  id="issue-status"
                  value={draft.status}
                  onChange={(event) => setField("status", event.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Pending">Chờ duyệt</option>
                  <option value="Approved">Đã duyệt</option>
                </select>
              </div>

              <div className="issue-filter-field">
                <label htmlFor="issue-invoice">Hóa đơn</label>
                <select
                  id="issue-invoice"
                  value={draft.hasInvoice}
                  onChange={(event) =>
                    setField("hasInvoice", event.target.value)
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="true">Đã có hóa đơn</option>
                  <option value="false">Chưa có hóa đơn</option>
                </select>
              </div>

              <div className="issue-filter-field">
                <label htmlFor="issue-from-date">Từ ngày</label>
                <input
                  id="issue-from-date"
                  type="date"
                  value={draft.fromDate}
                  onChange={(event) => setField("fromDate", event.target.value)}
                />
              </div>

              <div className="issue-filter-field">
                <label htmlFor="issue-to-date">Đến ngày</label>
                <input
                  id="issue-to-date"
                  type="date"
                  value={draft.toDate}
                  onChange={(event) => setField("toDate", event.target.value)}
                />
              </div>

              <div className="issue-filter-field">
                <label htmlFor="issue-sort-by">Sắp xếp theo</label>
                <select
                  id="issue-sort-by"
                  value={draft.sortBy}
                  onChange={(event) => setField("sortBy", event.target.value)}
                >
                  <option value="date">Ngày xuất</option>
                  <option value="code">Mã phiếu</option>
                  <option value="status">Trạng thái</option>
                  <option value="reason">Lý do xuất</option>
                </select>
              </div>

              <div className="issue-filter-field">
                <label htmlFor="issue-sort-order">Thứ tự</label>
                <select
                  id="issue-sort-order"
                  value={draft.sortOrder}
                  onChange={(event) =>
                    setField("sortOrder", event.target.value)
                  }
                >
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </select>
              </div>

              <div className="issue-filter-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                >
                  Xóa bộ lọc
                </button>

                <button type="submit" className="btn btn-primary">
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="table-toolbar">
          <div className="table-count">{totalItems} phiếu xuất</div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <IssueTable
              issues={issues}
              canApprove={canApprove}
              onView={handleView}
              onApprove={setIssueToApprove}
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

      {showForm && (
        <IssueForm
          products={products}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          submitting={submitting}
        />
      )}

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}

      {issueToApprove && (
        <ApproveIssueModal
          issue={issueToApprove}
          onSubmit={handleApprove}
          onClose={() => setIssueToApprove(null)}
          submitting={submitting}
        />
      )}
    </div>
  );
}
