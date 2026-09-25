import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getIssuesApi,
  getIssueApi,
  createIssueApi,
  approveIssueApi,
} from "../../api/issueApi";

import { getProductsApi } from "../../api/productApi";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

import IssueTable from "../../components/issues/IssueTable";
import IssueForm from "../../components/issues/IssueForm";
import IssueDetailModal from "../../components/issues/IssueDetailModal";
import ApproveIssueModal from "../../components/issues/ApproveIssueModal";

export default function IssuesPage() {
  const { user } = useAuth();

  const [issues, setIssues] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [selectedIssue, setSelectedIssue] = useState(null);

  const [issueToApprove, setIssueToApprove] = useState(null);

  const isAdminOrManager = user?.role === "Admin" || user?.role === "Manager";

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [issuesData, productsData] = await Promise.all([
        getIssuesApi(),
        getProductsApi(),
      ]);

      setIssues(issuesData || []);
      setProducts(productsData || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể tải dữ liệu phiếu xuất.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredIssues = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return issues;
    }

    return issues.filter((issue) =>
      [issue.issueCode, issue.reason, issue.creatorName, issue.status]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [issues, search]);

  const handleCreate = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      await createIssueApi(data);

      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tạo phiếu xuất.");
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
        err.response?.data?.message || "Không thể tải chi tiết phiếu xuất.",
      );
    }
  };

  const handleApprove = async (customerName) => {
    if (!issueToApprove) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await approveIssueApi(issueToApprove.id, customerName);

      setIssueToApprove(null);

      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể duyệt phiếu xuất.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

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
            onClick={loadData}
          >
            <RefreshCw size={17} />
            Làm mới
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={17} />
            Tạo phiếu xuất
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError("")} />}

      <div className="content-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã phiếu, lý do, người lập..."
            />
          </div>

          <div className="table-count">{filteredIssues.length} phiếu</div>
        </div>

        <IssueTable
          issues={filteredIssues}
          canApprove={isAdminOrManager}
          onView={handleView}
          onApprove={setIssueToApprove}
        />
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
