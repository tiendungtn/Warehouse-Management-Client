import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import {
  getReceiptsApi,
  getReceiptApi,
  createReceiptApi,
  approveReceiptApi,
} from "../../api/receiptApi";

import { getProductsApi } from "../../api/productApi";

import { useAuth } from "../../context/AuthContext";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";

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

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [receiptToApprove, setReceiptToApprove] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);

  const canApprove = user?.role === "Admin" || user?.role === "Manager";

  const loadReceipts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReceiptsApi();

      setReceipts(data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải danh sách phiếu nhập.",
      );
    } finally {
      setLoading(false);
    }
  };

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
    loadReceipts();
    loadProducts();
  }, []);

  const filteredReceipts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return receipts;
    }

    return receipts.filter((receipt) => {
      return (
        receipt.receiptCode?.toLowerCase().includes(keyword) ||
        receipt.supplierName?.toLowerCase().includes(keyword) ||
        receipt.creatorName?.toLowerCase().includes(keyword)
      );
    });
  }, [receipts, search]);

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
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Tìm mã phiếu, nhà cung cấp, người lập..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
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

      {loading ? (
        <Loading />
      ) : (
        <ReceiptTable
          receipts={filteredReceipts}
          canApprove={canApprove}
          onView={handleView}
          onApprove={setReceiptToApprove}
        />
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
