import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSearchFilters from "../../hooks/useSearchFilters";
import { Plus, Search } from "lucide-react";
import "../../styles/receipts.css";
import "../../styles/pagination.css";

import {
  getReceiptsApi,
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

export default function ReceiptsPage() {
  const { user } = useAuth();

  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [error, setError] = useState("");

  const { filters, updateFilters, resetFilters } = useSearchFilters();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(filters.search || "");

  const [totalItems, setTotalItems] = useState(0);

  const currentPage = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(1, Number(filters.pageSize) || 10);

  const [showForm, setShowForm] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [receiptToApprove, setReceiptToApprove] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);

  const canApprove = user?.role === "Admin" || user?.role === "Manager";

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

  const loadProducts = async () => {
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
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  useEffect(() => {
    setSearch(filters.search || "");
  }, [filters.search]);

  const handleSearch = (event) => {
    event.preventDefault();

    updateFilters({
      search: search.trim(),
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    updateFilters({ page }, { resetPage: false });
  };

  const handlePageSizeChange = (size) => {
    updateFilters({ pageSize: size, page: 1 }, { resetPage: false });
  };

  const handleResetSearch = () => {
    setSearch("");
    resetFilters();
  };

  const handleCreate = async (payload) => {
    setSubmitting(true);

    try {
      await createReceiptApi(payload);

      setShowForm(false);

      await loadReceipts();
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
    if (!receiptToApprove) {
      return;
    }

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
        <form className="search-box" onSubmit={handleSearch}>
          <Search size={18} />

          <input
            type="text"
            placeholder="Tìm mã phiếu, nhà cung cấp, người lập..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="submit" className="secondary-button">
            Tìm kiếm
          </button>

          <button
            type="button"
            className="icon-button"
            title="Đặt lại"
            onClick={handleResetSearch}
          >
            Đặt lại
          </button>
        </form>

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
          if (!approving) {
            setReceiptToApprove(null);
          }
        }}
        loading={approving}
      />
    </div>
  );
}
